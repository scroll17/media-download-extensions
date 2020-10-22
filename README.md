# Chrome extension for a download and publish content from instagram 

## Extension
It's Google Chrome extension. <br/>
Extension makes it possible to select content on the Instagram page and then sends the selected content to the server.

## Server
**The server allows you to publish content at a selected time (now or later)** <br/>
**The server uses the Ngrok for local tunneling**

- Server getting request from extension (with user id and user token).
- The request consist with desired time, url of content, caption for content and type of content.
- After request server download content and Telegram bot notifies user about new content to publish.
- User approving or disable new publications (notice contains cover image, buttons for select action, and button for get full file content).
- If user approved publication, then the server will start a delayed job for publish content and after published will notify user about this.

**Telegram bot have commands**: 
- register - Register in bot
- scheduler - Calendar of scheduled publications
- get_id - Get you id in database
- get_logs - Get server logs
- get_token - Get the key to access the server
- get_content - Get file content
- get_server_url - Get the server url for extension input
- get_server_time - Time on server
- get_time_to_publish - Time before publication

## Launch server
To start the server you need two configs files: _ngrok.json_ and _conf.json_. <br/>
Config files should lie in **server/src**

**ngrok.json**: 
```typescript
    type TNgrok = {
      authtoken: string;
    }
```

**conf.json**: 
```typescript
    type TConf = {
      IG_USERNAME: string;
      IG_PASSWORD: string;
      PORT: number;
      VALID_TELEGRAM_IDS: number[];
      TG_TOKEN: string;
      REDIS_CONF: object;
    }
```

You can contact me in [telegram](https://t.me/sckroll17) or [email](mailto:zololotarenko.2015@gmail.com).
