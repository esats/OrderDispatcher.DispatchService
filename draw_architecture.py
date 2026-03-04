from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1400, 900
bg = "#1e1e2e"
img = Image.new("RGB", (W, H), bg)
draw = ImageDraw.Draw(img)

# Try to load a nice font, fall back to default
try:
    font = ImageFont.truetype("consola.ttf", 15)
    font_sm = ImageFont.truetype("consola.ttf", 12)
    font_title = ImageFont.truetype("consola.ttf", 22)
except:
    try:
        font = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", 15)
        font_sm = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", 12)
        font_title = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", 22)
    except:
        font = ImageFont.load_default()
        font_sm = font
        font_title = font

# Colors
C_APP = "#89b4fa"       # blue - client apps
C_GW = "#f9e2af"        # yellow - gateway
C_SVC = "#a6e3a1"       # green - services
C_MQ = "#fab387"        # orange - rabbitmq
C_DB = "#cba6f7"        # purple - database
C_WS = "#f38ba8"        # pink - websocket/realtime
C_S3 = "#94e2d5"        # teal - aws
C_TEXT = "#cdd6f4"
C_ARROW = "#7f849c"
C_BORDER_APP = "#74c7ec"
C_BORDER_GW = "#f2cdcd"
C_BORDER_SVC = "#94e2d5"

def rounded_rect(x, y, w, h, color, border_color=None, radius=12):
    """Draw a rounded rectangle with fill and optional border."""
    draw.rounded_rectangle([x, y, x + w, y + h], radius=radius, fill=color, outline=border_color, width=2)

def center_text(text, x, y, w, h, fill=C_TEXT, f=None):
    """Draw centered text within a bounding box."""
    if f is None:
        f = font
    bbox = f.getbbox(text)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = x + (w - tw) // 2
    ty = y + (h - th) // 2
    draw.text((tx, ty), text, fill=fill, font=f)

def arrow(x1, y1, x2, y2, color=C_ARROW, width=2):
    """Draw a line with an arrowhead."""
    draw.line([(x1, y1), (x2, y2)], fill=color, width=width)
    # arrowhead
    import math
    angle = math.atan2(y2 - y1, x2 - x1)
    size = 10
    for sign in [1, -1]:
        ax = x2 - size * math.cos(angle + sign * 0.4)
        ay = y2 - size * math.sin(angle + sign * 0.4)
        draw.line([(x2, y2), (int(ax), int(ay))], fill=color, width=width)

def dashed_line(x1, y1, x2, y2, color=C_ARROW, width=2, dash_len=8):
    """Draw a dashed line."""
    import math
    dx = x2 - x1
    dy = y2 - y1
    dist = math.sqrt(dx*dx + dy*dy)
    if dist == 0:
        return
    steps = int(dist / dash_len)
    for i in range(0, steps, 2):
        sx = x1 + dx * i / steps
        sy = y1 + dy * i / steps
        ex = x1 + dx * min(i + 1, steps) / steps
        ey = y1 + dy * min(i + 1, steps) / steps
        draw.line([(int(sx), int(sy)), (int(ex), int(ey))], fill=color, width=width)

# ─── Title ───
center_text("OrderDispatcher - Mimari Diagram", 0, 15, W, 40, fill=C_GW, f=font_title)

# ─── Client Apps (top row) ───
apps = [("Customer App", 280), ("Store App", 600), ("Shopper App", 920)]
app_w, app_h = 170, 50
app_y = 75

for name, cx in apps:
    x = cx - app_w // 2
    rounded_rect(x, app_y, app_w, app_h, "#313244", C_APP)
    center_text(name, x, app_y, app_w, app_h, fill=C_APP)

# ─── Arrows from apps to gateway ───
gw_y = 185
gw_x = 180
gw_w = 1040
gw_h = 55

for _, cx in apps:
    arrow(cx, app_y + app_h, cx, gw_y, color=C_APP)

# ─── API Gateway ───
rounded_rect(gw_x, gw_y, gw_w, gw_h, "#313244", C_GW)
center_text("API GATEWAY  (Ocelot :9000)", gw_x, gw_y, gw_w, gw_h, fill=C_GW)

# ─── Services row ───
svc_y = 305
svc_w = 175
svc_h = 60

services = [
    ("AuthService", ":7000", 230),
    ("CatalogService", ":5174", 480),
    ("OrderManagement", ":5175", 730),
    ("EngagementService", ":5212", 1000),
]

for name, port, cx in services:
    x = cx - svc_w // 2
    rounded_rect(x, svc_y, svc_w, svc_h, "#313244", C_SVC)
    center_text(name, x, svc_y, svc_w, 35, fill=C_SVC)
    center_text(port, x, svc_y + 30, svc_w, 25, fill="#585b70", f=font_sm)

# ─── Arrows from gateway to services ───
for _, _, cx in services:
    arrow(cx, gw_y + gw_h, cx, svc_y, color=C_GW)

# ─── RabbitMQ Broker (Profil Sync) ───
broker_y = 445
broker_x = 95
broker_w = 270
broker_h = 55

rounded_rect(broker_x, broker_y, broker_w, broker_h, "#313244", C_MQ)
center_text("RabbitMQ Broker", broker_x, broker_y, broker_w, 32, fill=C_MQ)
center_text("(Profil Sync)", broker_x, broker_y + 28, broker_w, 25, fill="#585b70", f=font_sm)

# Arrow from AuthService down to RabbitMQ Broker
arrow(230, svc_y + svc_h, 230, broker_y, color=C_MQ)

# ─── EngagementDB ───
db_y = 570
db_x = 130
db_w = 200
db_h = 50

rounded_rect(db_x, db_y, db_w, db_h, "#313244", C_DB)
center_text("EngagementDB", db_x, db_y, db_w, db_h, fill=C_DB)

arrow(230, broker_y + broker_h, 230, db_y, color=C_DB)

# ─── DispatchService ───
ds_y = 445
ds_x = 570
ds_w = 320
ds_h = 65

rounded_rect(ds_x, ds_y, ds_w, ds_h, "#313244", C_WS)
center_text("DispatchService", ds_x, ds_y, ds_w, 30, fill=C_WS)
center_text("Redis + RabbitMQ + WebSocket", ds_x, ds_y + 25, ds_w, 22, fill="#585b70", f=font_sm)
center_text(":3000", ds_x, ds_y + 42, ds_w, 22, fill="#585b70", f=font_sm)

# Arrow from OrderManagement down to DispatchService
arrow(730, svc_y + svc_h, 730, ds_y, color=C_WS)

# ─── Shopper App (realtime) ───
shopper_rt_y = 580
shopper_rt_x = 630
shopper_rt_w = 200
shopper_rt_h = 55

rounded_rect(shopper_rt_x, shopper_rt_y, shopper_rt_w, shopper_rt_h, "#313244", C_APP)
center_text("Shopper App", shopper_rt_x, shopper_rt_y, shopper_rt_w, 32, fill=C_APP)
center_text("(Gercek Zamanli)", shopper_rt_x, shopper_rt_y + 25, shopper_rt_w, 25, fill="#585b70", f=font_sm)

arrow(730, ds_y + ds_h, 730, shopper_rt_y, color=C_APP)

# ─── Double-headed arrow or WebSocket indicator ───
# Add a small "WS" label on the connection
ws_label_y = (ds_y + ds_h + shopper_rt_y) // 2 - 8
draw.text((740, ws_label_y), "WS", fill=C_WS, font=font_sm)

# ─── FileProcessor ───
fp_y = 700
fp_x = 530
fp_w = 200
fp_h = 50

rounded_rect(fp_x, fp_y, fp_w, fp_h, "#313244", C_S3)
center_text("FileProcessor", fp_x, fp_y, fp_w, 30, fill=C_S3)
center_text(":5050", fp_x, fp_y + 25, fp_w, 22, fill="#585b70", f=font_sm)

# ─── AWS S3 ───
s3_y = 700
s3_x = 850
s3_w = 160
s3_h = 50

rounded_rect(s3_x, s3_y, s3_w, s3_h, "#313244", C_S3)
center_text("AWS S3", s3_x, s3_y, s3_w, s3_h, fill=C_S3)

# Arrow from FileProcessor to S3
arrow(fp_x + fp_w, fp_y + fp_h // 2, s3_x, s3_y + s3_h // 2, color=C_S3)

# ─── Legend ───
legend_x = 1050
legend_y = 770
legend_items = [
    (C_APP, "Client Apps"),
    (C_GW, "API Gateway"),
    (C_SVC, "Microservices"),
    (C_MQ, "Message Queue"),
    (C_DB, "Database"),
    (C_WS, "Dispatch/WS"),
    (C_S3, "Cloud Storage"),
]
for i, (color, label) in enumerate(legend_items):
    y = legend_y + i * 18
    draw.rectangle([legend_x, y + 2, legend_x + 12, y + 14], fill=color)
    draw.text((legend_x + 18, y), label, fill=C_TEXT, font=font_sm)

# ─── Save ───
out_path = os.path.join(os.path.dirname(__file__), "architecture_diagram.png")
img.save(out_path, "PNG", quality=95)
print(f"Saved to: {out_path}")
