"""
Flask app to serve the single page app and mediate the calls to Google vision API
"""

import logging
import os

import requests as rq
from flask import Flask, render_template, flash, request, jsonify, url_for, send_from_directory
from werkzeug.utils import secure_filename
from flask_cors import CORS, cross_origin

from config import Config
from ocr_core import ocr_core


if True:   # set up logger
    logger = logging.getLogger('exabler_fin')
    logger.setLevel(logging.DEBUG)
    # crate file handler
    fh = logging.FileHandler('exableruk_fin.log')
    fh.setLevel(logging.DEBUG)
    # create console handler with possibly higher log level
    ch = logging.StreamHandler()
    ch.setLevel(logging.INFO)
    # create formatter and apply to handlers
    formatter = logging.Formatter("%(asctime)23s - %(name)15s - %(levelname)s - %(funcName)15s() - %(message)s")
    fh.setFormatter(formatter)
    ch.setFormatter(formatter)
    # add the handlers to the logger
    logger.addHandler(fh)
    logger.addHandler(ch)

UPLOAD_FOLDER = './static/images/'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app = Flask(__name__)
app.secret_key = b"sdf0SDF'wer023pkj"
app.config.from_object(Config)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/", methods=["GET", "POST"])
def home():

    if request.method == "GET":
        logger.info("serving homepage page.html")
        # return app.send_static_file("grey.html")
        return render_template('page.html')

    elif request.method == "POST":
        # check if there is a file in the request
        logger.info(request.files)
        if 'file2' not in request.files:
            # return jsonify({"note": "No file selected"})
            render_template('page.html', msg="No file selected")
        file = request.files['file2']
        if file.filename == '':
            # return jsonify({"note": "no file selected"})
            render_template('page.html', msg="No file selected")
        
        if file and allowed_file(file.filename):
            logger.info("saving file")
            filename = secure_filename(file.filename)
            file.save( os.path.join( app.config["UPLOAD_FOLDER"], filename))
            logger.info("running ocr")
            extracted_text = ocr_core(os.path.join( app.config["UPLOAD_FOLDER"], filename))
            if (extracted_text is None) or (extracted_text == ""):
                extracted_text = "No text was found"
                logger.info(extracted_text)
            else:
                logger.info("Found "+extracted_text)
            return render_template('page.html',
                        extracted_text=extracted_text,
                        msg="Successfully processed",
                        img_src=url_for('uploaded_file', filename=filename)
                        )


@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route("/js/main.js", methods=["GET"])
def js_main():
    return app.send_static_file("main.js")

@app.route("/js/vendor/jquery-3.4.1.min.js", methods=["GET"])
def js_jquery():
    return app.send_static_file("jquery-3.4.1.min.js")

@app.route("/css/main.css", methods=["GET"])
def css_main():
    return app.send_static_file("main.css")

@app.route("/spinner.gif", methods=["GET"])
def spinnergif():
    return app.send_static_file("spinner.gif")

@app.route("/css/normalize.css", methods=["GET"])
def css_normalize():
    return app.send_static_file("normalize.css")

