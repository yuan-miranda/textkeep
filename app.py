from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route("/submit", methods=["POST"])
def submit():
    data = request.get_json()
    text = data.get("text")
    title = data.get("title")
    description = data.get("description")
    tags = data.get("tags", [])
    visibility_mode = data.get("visibilityMode")
    duration_mode = data.get("durationMode")
    specific_users_tags = data.get("specificUsersTags", [])
    view_value = data.get("viewValue")
    date_value = data.get("dateValue")
    time_value = data.get("timeValue")

    text_size_kib = len(text.encode("utf-8")) / 1024
    print(f"Text size: {text_size_kib:.3f} KiB")

    return jsonify(data)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)