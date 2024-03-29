import pandas as pd
import xgboost as xgb
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import yfinance as yf
from datetime import datetime


def get_stock_data(ticker):
    stock = yf.Ticker(ticker)
    data = stock.history(period="max")
    return data


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


@app.after_request
def add_header(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

models = {}

for company in ['TSLA', 'AAPL', 'AMZN', 'GOOGL', 'MSFT']:
    stock_data = yf.download(company, period="max")
    
    # yfinance already uses a DatetimeIndex, so there's no need to explicitly set it again
    
    # Ensure column names are lowercase to maintain consistency
    stock_data.columns = stock_data.columns.str.lower()

    # Convert 'volume' to numeric, coercing errors to NaN, then fill NaN with 0
    stock_data['volume'] = pd.to_numeric(stock_data['volume'], errors='coerce').fillna(0)

    train_data = stock_data.iloc[:int(0.99 * len(stock_data))]
    features = ["open", "volume"]
    target = "close"

    model = xgb.XGBRegressor()
    model.fit(train_data[features], train_data[target])

    models[company] = model

def get_historical_data(stock_data, time_frame):
    if time_frame == 'next day':
        return stock_data['close'][-8:].tolist()
    elif time_frame == 'next week':
        return stock_data['close'].resample('W').last()[-8:].tolist()
    elif time_frame == 'next month':
        return stock_data['close'].resample('M').last()[-8:].tolist()
    elif time_frame == 'next year':
        return stock_data['close'].resample('Y').last()[-8:].tolist()
    return []



@app.route('/predict', methods=['POST'])
@cross_origin()
def predict():
    data = request.json
    company = data['symbol']
    time_frame = data['timeFrame']

    stock_data = yf.download(company, period="max")
    stock_data.columns = stock_data.columns.str.lower()

    historical_data = get_historical_data(stock_data, time_frame)

    model = models.get(company)
    if model:
        latest_data = stock_data.iloc[-1][["open", "volume"]].values.reshape(1, -1)
        prediction = model.predict(latest_data).tolist()
    else:
        prediction = [0]  # Default prediction if the model is not found

    response = jsonify({'historical': historical_data, 'prediction': prediction[0]})
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

def get_stock_data(ticker):
    stock = yf.Ticker(ticker)
    data = stock.history(period="max")
    return data

@app.route('/daily', methods=['POST'])
@cross_origin()
def daily():
    data = request.json
    company = data['symbol']
    selected_date = datetime.strptime(data['date'], '%Y-%m-%d')

    # Use the get_stock_data function to fetch stock data
    stock_data = get_stock_data(company)
    stock_data.columns = stock_data.columns.str.lower()

    # Filter the stock data for the selected date
    daily_data = stock_data[stock_data.index.date == selected_date.date()]['close'].tolist()

    response = jsonify({'daily': daily_data})
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


if __name__ == '__main__':
    app.run(debug=True)
