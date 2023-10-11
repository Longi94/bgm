from flask import Flask, request, jsonify
from flask_cors import CORS
import xml.etree.ElementTree as ET
import traceback
import requests_cache
from requests.adapters import HTTPAdapter, Retry
from retry import retry
import logging
import json
import os

logging.basicConfig()

app = Flask(__name__)
CORS(app)

games_session = requests_cache.CachedSession("games_cache", expire_after=604800)
user_session = requests_cache.CachedSession("user_cache", expire_after=3600)

retries = Retry(total=5, backoff_factor=1, status_forcelist=[500, 502, 503, 504])

games_session.mount("http://", HTTPAdapter(max_retries=retries))
user_session.mount("http://", HTTPAdapter(max_retries=retries))

BGG_API_URL = "https://www.boardgamegeek.com/xmlapi2"


@retry(tries=5, delay=1, backoff=2)
def get_owned_boardgames():
    url = f"{BGG_API_URL}/collection?username=Longi94&own=1&excludesubtype=boardgameexpansion"
    response = user_session.get(url)
    root = ET.fromstring(response.content)

    games = []
    for item in root.findall(".//item"):
        games.append(
            {
                "id": item.attrib["objectid"],
                "name": item.find("name").text,
                "image": item.find("image").text,
                "thumbnail": item.find("thumbnail").text,
                "numplays": int(item.find("numplays").text),
            }
        )
    return games

@retry(tries=5, delay=1, backoff=2)
def get_boardgame_details(game_id):
    url = f"{BGG_API_URL}/thing?id={game_id}&stats=1"
    response = games_session.get(url)
    root = ET.fromstring(response.content)

    item = root.find(".//item")
    ratings = item.find("statistics/ratings")

    return {
        "game": {
            "name": item.find("name").attrib.get("value"),
            "yearpublished": item.find("yearpublished").attrib.get("value"),
            "minplayers": int(item.find("minplayers").attrib.get("value")),
            "maxplayers": int(item.find("maxplayers").attrib.get("value")),
            "minplaytime": int(item.find("minplaytime").attrib.get("value")),
            "maxplaytime": int(item.find("maxplaytime").attrib.get("value")),
            "description": item.find(".//description").text,
            "mechanics": list(
                map(
                    lambda x: x.attrib.get("value"),
                    item.findall('link[@type="boardgamemechanic"]'),
                )
            ),
            "categories": list(
                map(
                    lambda x: x.attrib.get("value"),
                    item.findall('link[@type="boardgamecategory"]'),
                )
            ),
            "suggested_numplayers": list(
                map(
                    lambda x: {
                        "numplayers": x.attrib.get("numplayers"),
                        "best": int(
                            x.find('result[@value="Best"]').attrib.get("numvotes")
                        ),
                        "recommended": int(
                            x.find('result[@value="Recommended"]').attrib.get(
                                "numvotes"
                            )
                        ),
                        "not_recomended": int(
                            x.find('result[@value="Not Recommended"]').attrib.get(
                                "numvotes"
                            )
                        ),
                    },
                    item.find('poll[@name="suggested_numplayers"]').findall("results"),
                )
            ),
            "ratings": {
                "average": float(ratings.find("average").attrib.get("value")),
                "averageweight": float(
                    ratings.find("averageweight").attrib.get("value")
                ),
            },
        }
    }


def persist_game(id, details):
    with open(f"games/{id}.json", "w") as f:
        json.dump(details, f)


def get_persisted_game(id):
    try:
        with open(f"games/{id}.json", "r") as f:
            return json.load(f)
    except Exception:
        return None


@app.route("/owned", methods=["GET"])
def owned_boardgames():
    try:
        games = get_owned_boardgames()
        return jsonify({"games": games})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/boardgame", methods=["GET"])
def boardgame_details():
    game_id = request.args.get("id")
    if not game_id:
        return jsonify({"error": "Missing 'id' parameter"}), 400

    try:
        details = get_boardgame_details(game_id)
        persist_game(game_id, details)
        return jsonify(details)
    except Exception as e:
        print(traceback.format_exc())
        details = get_persisted_game(game_id)
        if details is not None:
            return jsonify(details)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    os.makedirs("games", exist_ok=True)
    app.run(debug=True, port=9010)
