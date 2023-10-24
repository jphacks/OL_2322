import logging
import os
import psycopg2
import json
from datetime import datetime
from slack_sdk import WebClient
from slack_bolt import App
from slack_bolt.adapter.socket_mode import SocketModeHandler

logging.basicConfig(level=logging.DEBUG)

app = App(token=os.environ["SLACK_BOT_TOKEN"])
user_clinet = WebClient(token=os.environ["SLACK_USER_TOKEN"])
bot_client = WebClient(token=os.environ["SLACK_BOT_TOKEN"])

try:
    connection = psycopg2.connect(
        host="db",
        user="user",
        password="password",
        database="mydatabase_development",
    )
    print("データベースの接続に成功しました")
except Exception as e:
    connection = None
    print("データベースの接続に失敗しました")


# メッセージイベントがあった時に発火
@app.event("message")
def handle_message_events(body: dict, client, logger, respond):
    logger.debug(json.dumps(body, indent=4))

    element_length = len(
        body.get("event", {})
        .get("blocks", [{}])[0]
        .get("elements", [{}])[0]
        .get("elements", [{}])
    )
    file_length = len(body.get("event", {}).get("files", [{}]))
    if element_length > file_length:
        loop = element_length
    else:
        loop = file_length

    user = body.get("event", {}).get("user", "")
    channel = body.get("event", {}).get("channel", "")
    ts = body.get("event", {}).get("ts", "")
    thread_ts = body.get("event", {}).get("thread_ts", "")
    elements = (
        body.get("event", {})
        .get("blocks", [{}])[0]
        .get("elements", [{}])[0]
        .get("elements", [])
    )
    files = body.get("event", {}).get("files", [])

    for i in range(loop):
        element = elements[i] if i < len(elements) else {}
        text = element.get("text", "")
        url = element.get("url", "")

        file = files[i] if i < len(files) else {}
        image_name = file.get("name", "")
        image_url = file.get("url_private", "")

        if connection is not None:
            try:
                cursor = connection.cursor()
                current_datetime = datetime.now()
                sql = "INSERT INTO messages (channel_id, user_id, ts, thread_ts, text, url, image_name, image_url, created_at, updated_at) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
                cursor.execute(
                    sql,
                    (
                        channel,
                        user,
                        ts,
                        thread_ts,
                        text,
                        url,
                        image_name,
                        image_url,
                        current_datetime,
                        current_datetime,
                    ),
                )
                connection.commit()
                logger.info("データの挿入に成功しました")
            except Exception as e:
                logger.info("データの挿入に失敗しました")
            cursor.close()
        else:
            logger.error("データベースへの接続に失敗したため、クエリを実行できません。")


@app.event("channel_created")
def handle_channel_create_event(event, logger):
    logger.debug("This is channel created event" + json.dumps(event, indent=4))

    channel_id = event.get("channel", {}).get("id", "")
    name = event.get("channel", {}).get("name", "")
    creator = event.get("channel", {}).get("creator", "")
    is_private = event.get("channel", {}).get(
        "is_private", False
    )  # is_privateは存在しないため，Falseが入る

    if connection is not None:
        try:
            cursor = connection.cursor()
            current_datetime = datetime.now()
            sql = "INSERT INTO channels (channel_id, name, creator, is_private, created_at, updated_at) VALUES (%s, %s, %s, %s, %s, %s)"
            cursor.execute(
                sql,
                (
                    channel_id,
                    name,
                    creator,
                    is_private,
                    current_datetime,
                    current_datetime,
                ),
            )
            connection.commit()
            logger.info("データの挿入に成功しました")
        except Exception as e:
            logger.error("データの挿入に失敗しました")
        cursor.close()
    else:
        logger.error("データベースへの接続に失敗したため、クエリを実行できません。")

    logger.debug("channel_id: " + channel_id)
    logger.debug("name: " + name)
    logger.debug("creator: " + creator)


@app.command("/get_channels")
def get_channels(ack, logger):
    ack()
    bot_response = bot_client.conversations_list(
        types="public_channel, private_channel"
    )
    channels = bot_response.get("channels", [])
    logger.debug(bot_response)
    for channel in channels:
        channel_id = channel.get("id", "")
        name = channel.get("name", "")
        creator = channel.get("creator", "")
        is_private = channel.get("is_private", False)  # is_privateは存在しないため，Falseが入る

        logger.debug("channel_id: " + channel_id)
        logger.debug("name: " + name)
        logger.debug("creator: " + creator)

        if connection is not None:
            try:
                cursor = connection.cursor()
                current_datetime = datetime.now()
                sql = "INSERT INTO channels (channel_id, name, creator, is_private, created_at, updated_at) VALUES (%s, %s, %s, %s, %s, %s)"
                cursor.execute(
                    sql,
                    (
                        channel_id,
                        name,
                        creator,
                        is_private,
                        current_datetime,
                        current_datetime,
                    ),
                )
                connection.commit()
                logger.info("データの挿入に成功しました")
            except Exception as e:
                logger.error("データの挿入に失敗しました")
            cursor.close()
        else:
            logger.error("データベースへの接続に失敗したため、クエリを実行できません。")


@app.command("/get_all_channel_members")
def get_all_channel_members(ack, logger):
    ack()
    bot_response = bot_client.conversations_list(
        types="public_channel, private_channel"
    )

    # 全てのチャンネルを取得
    channels = bot_response.get("channels", [])
    for channel in channels:
        channel_id = channel.get("id", "")
        channel_name = channel.get("name", "")

        logger.debug(channel_id)
        logger.debug(channel_name)

        member_response = bot_client.conversations_members(channel=channel_id)

        if member_response.get("ok", ""):
            # チャンネルの全てのユーザを取得
            members = member_response.get("members", "")
            logger.debug(json.dumps(members, indent=4))
            for member_id in members:
                logger.debug("channel_id: " + channel_id + "member_id: " + member_id)

                if connection is not None:
                    try:
                        cursor = connection.cursor()
                        current_datetime = datetime.now()
                        sql = "INSERT INTO members (channel_id, user_id, created_at, updated_at) VALUES (%s, %s, %s, %s)"
                        cursor.execute(
                            sql,
                            (
                                channel_id,
                                member_id,
                                current_datetime,
                                current_datetime,
                            ),
                        )
                        connection.commit()
                        logger.info("データの挿入に成功しました")
                    except Exception as e:
                        logger.error("データの挿入に失敗しました")
                    cursor.close()
                else:
                    logger.error("データベースへの接続に失敗したため、クエリを実行できません。")


if __name__ == "__main__":
    handler = SocketModeHandler(app, os.environ["SLACK_APP_TOKEN"])
    handler.start()
