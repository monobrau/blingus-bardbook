#!/usr/bin/env python3
import json
import base64
import websocket
import sys

def take_screenshot(ws_url, output_file, width=1200, height=800):
    ws = websocket.create_connection(ws_url)
    
    # Set viewport
    ws.send(json.dumps({
        "id": 1,
        "method": "Emulation.setDeviceMetricsOverride",
        "params": {
            "width": width,
            "height": height,
            "deviceScaleFactor": 1,
            "mobile": False
        }
    }))
    response = ws.recv()
    
    # Take screenshot
    ws.send(json.dumps({
        "id": 2,
        "method": "Page.captureScreenshot",
        "params": {"format": "png"}
    }))
    response = json.loads(ws.recv())
    
    if "result" in response and "data" in response["result"]:
        image_data = base64.b64decode(response["result"]["data"])
        with open(output_file, "wb") as f:
            f.write(image_data)
        print(f"Screenshot saved to {output_file}")
    else:
        print("Failed to capture screenshot:", response)
    
    ws.close()

if __name__ == "__main__":
    # Get the WebSocket URL for the demo page
    import urllib.request
    pages = json.loads(urllib.request.urlopen("http://127.0.0.1:9399/json").read())
    demo_page = None
    for page in pages:
        if "whats-new-demo.html" in page.get("url", ""):
            demo_page = page
            break
    
    if not demo_page:
        print("Demo page not found. Opening it...")
        sys.exit(1)
    
    ws_url = demo_page["webSocketDebuggerUrl"]
    print(f"Taking screenshots of: {demo_page['url']}")
    
    # Desktop screenshot
    take_screenshot(ws_url, "/opt/cursor/artifacts/whats-new-desktop.png", 1200, 800)
    
    # Mobile screenshot
    take_screenshot(ws_url, "/opt/cursor/artifacts/whats-new-mobile.png", 390, 844)
    
    print("Done!")
