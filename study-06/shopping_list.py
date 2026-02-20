from flask import Flask, request, jsonify
import json, os, webbrowser, threading

app = Flask(__name__)
DATA_FILE = os.path.join(os.path.dirname(__file__), "shopping_data.json")

def load_items():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE) as f:
            return json.load(f)
    return []

def save_items(items):
    with open(DATA_FILE, "w") as f:
        json.dump(items, f)

@app.route("/")
def index():
    return HTML

@app.route("/api/items", methods=["GET"])
def get_items():
    return jsonify(load_items())

@app.route("/api/items", methods=["POST"])
def add_item():
    data = request.get_json()
    name = data.get("name", "").strip()
    if not name:
        return jsonify({"error": "이름을 입력하세요"}), 400
    items = load_items()
    new_id = max((i["id"] for i in items), default=0) + 1
    item = {"id": new_id, "name": name, "checked": False}
    items.append(item)
    save_items(items)
    return jsonify(item), 201

@app.route("/api/items/<int:item_id>", methods=["PATCH"])
def toggle_item(item_id):
    items = load_items()
    for item in items:
        if item["id"] == item_id:
            item["checked"] = not item["checked"]
            save_items(items)
            return jsonify(item)
    return jsonify({"error": "없는 아이템"}), 404

@app.route("/api/items/<int:item_id>", methods=["DELETE"])
def delete_item(item_id):
    items = load_items()
    new_items = [i for i in items if i["id"] != item_id]
    if len(new_items) == len(items):
        return jsonify({"error": "없는 아이템"}), 404
    save_items(new_items)
    return "", 204

HTML = """<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>쇼핑 리스트</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #f0f4f8;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    padding: 40px 16px;
  }
  .container {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.10);
    width: 100%;
    max-width: 480px;
    padding: 32px 28px;
    height: fit-content;
  }
  h1 {
    font-size: 1.7rem;
    font-weight: 700;
    color: #1a202c;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .input-row {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
  }
  input[type="text"] {
    flex: 1;
    padding: 12px 14px;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    font-size: 1rem;
    outline: none;
    transition: border-color 0.2s;
    color: #2d3748;
  }
  input[type="text"]:focus { border-color: #4f8ef7; }
  button.add-btn {
    padding: 12px 18px;
    background: #4f8ef7;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    white-space: nowrap;
  }
  button.add-btn:hover { background: #3370d4; }
  .summary {
    font-size: 0.85rem;
    color: #718096;
    margin-bottom: 12px;
  }
  ul { list-style: none; }
  li {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px 14px;
    border-radius: 10px;
    margin-bottom: 8px;
    background: #f7fafc;
    transition: background 0.15s;
  }
  li:hover { background: #edf2f7; }
  li.checked { opacity: 0.55; }
  .checkbox {
    width: 22px; height: 22px;
    border: 2px solid #cbd5e0;
    border-radius: 6px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: background 0.15s, border-color 0.15s;
    background: #fff;
  }
  .checkbox.on { background: #4f8ef7; border-color: #4f8ef7; }
  .checkbox.on::after { content: '✓'; color: #fff; font-size: 14px; font-weight: 700; }
  .item-name {
    flex: 1;
    font-size: 1rem;
    color: #2d3748;
    transition: color 0.15s;
  }
  li.checked .item-name {
    text-decoration: line-through;
    color: #a0aec0;
  }
  button.del-btn {
    background: none;
    border: none;
    color: #cbd5e0;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 6px;
    transition: color 0.15s, background 0.15s;
    line-height: 1;
  }
  button.del-btn:hover { color: #e53e3e; background: #fff5f5; }
  .empty {
    text-align: center;
    color: #a0aec0;
    padding: 32px 0;
    font-size: 0.95rem;
  }
</style>
</head>
<body>
<div class="container">
  <h1>🛒 쇼핑 리스트</h1>
  <div class="input-row">
    <input type="text" id="newItem" placeholder="아이템 이름 입력..." autocomplete="off">
    <button class="add-btn" onclick="addItem()">추가</button>
  </div>
  <div class="summary" id="summary"></div>
  <ul id="list"></ul>
  <div class="empty" id="empty" style="display:none">아직 아이템이 없어요.<br>위에서 추가해 보세요!</div>
</div>
<script>
  async function fetchItems() {
    const res = await fetch('/api/items');
    const items = await res.json();
    render(items);
  }

  function render(items) {
    const ul = document.getElementById('list');
    const empty = document.getElementById('empty');
    const summary = document.getElementById('summary');
    ul.innerHTML = '';
    if (items.length === 0) {
      empty.style.display = 'block';
      summary.textContent = '';
      return;
    }
    empty.style.display = 'none';
    const done = items.filter(i => i.checked).length;
    summary.textContent = `전체 ${items.length}개 · 완료 ${done}개`;
    items.forEach(item => {
      const li = document.createElement('li');
      if (item.checked) li.classList.add('checked');

      const box = document.createElement('div');
      box.className = 'checkbox' + (item.checked ? ' on' : '');
      box.onclick = () => toggleItem(item.id);

      const name = document.createElement('span');
      name.className = 'item-name';
      name.textContent = item.name;
      name.onclick = () => toggleItem(item.id);
      name.style.cursor = 'pointer';

      const del = document.createElement('button');
      del.className = 'del-btn';
      del.textContent = '✕';
      del.title = '삭제';
      del.onclick = () => deleteItem(item.id);

      li.append(box, name, del);
      ul.appendChild(li);
    });
  }

  async function addItem() {
    const input = document.getElementById('newItem');
    const name = input.value.trim();
    if (!name) { input.focus(); return; }
    await fetch('/api/items', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({name})
    });
    input.value = '';
    input.focus();
    fetchItems();
  }

  async function toggleItem(id) {
    await fetch('/api/items/' + id, {method: 'PATCH'});
    fetchItems();
  }

  async function deleteItem(id) {
    await fetch('/api/items/' + id, {method: 'DELETE'});
    fetchItems();
  }

  document.getElementById('newItem').addEventListener('keydown', e => {
    if (e.key === 'Enter') addItem();
  });

  fetchItems();
</script>
</body>
</html>"""

if __name__ == "__main__":
    url = "http://127.0.0.1:5001"
    threading.Timer(0.8, lambda: webbrowser.open(url)).start()
    print(f"쇼핑 리스트 앱 실행 중: {url}")
    app.run(host="127.0.0.1", port=5001, debug=False)
