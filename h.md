finnhub-python
API documentation: https://finnhub.io/docs/api
API version: 1.0.0
Package version: 2.4.24
Installation
Install package

pip install finnhub-python
Getting Started
Refer to CHANGELOG If you are coming from version 1

import finnhub

# Setup client
finnhub_client = finnhub.Client(api_key="YOUR API KEY")

# Stock candles
res = finnhub_client.stock_candles('AAPL', 'D', 1590988249, 1591852249)
print(res)

#Convert to Pandas Dataframe
import pandas as pd
print(pd.DataFrame(res))

# Aggregate Indicators
print(finnhub_client.aggregate_indicator('AAPL', 'D'))

# Basic financials
print(finnhub_client.company_basic_financials('AAPL', 'all'))

# Earnings surprises
print(finnhub_client.company_earnings('TSLA', limit=5))

# EPS estimates
print(finnhub_client.company_eps_estimates('AMZN', freq='quarterly'))

# Company Executives
print(finnhub_client.company_executive('AAPL'))

# Company News
# Need to use _from instead of from to avoid conflict
print(finnhub_client.company_news('AAPL', _from="2020-06-01", to="2020-06-10"))

# Company Peers
print(finnhub_client.company_peers('AAPL'))

# Company Profile
print(finnhub_client.company_profile(symbol='AAPL'))
print(finnhub_client.company_profile(isin='US0378331005'))
print(finnhub_client.company_profile(cusip='037833100'))

# Company Profile 2
print(finnhub_client.company_profile2(symbol='AAPL'))

# Revenue Estimates
print(finnhub_client.company_revenue_estimates('TSLA', freq='quarterly'))

# List country
print(finnhub_client.country())

# Crypto Exchange
print(finnhub_client.crypto_exchanges())

# Crypto symbols
print(finnhub_client.crypto_symbols('BINANCE'))

# Economic data
print(finnhub_client.economic_data('MA-USA-656880'))

# Filings
print(finnhub_client.filings(symbol='AAPL', _from="2020-01-01", to="2020-06-11"))

# Financials
print(finnhub_client.financials('AAPL', 'bs', 'annual'))

# Financials as reported
print(finnhub_client.financials_reported(symbol='AAPL', freq='annual'))

# Forex exchanges
print(finnhub_client.forex_exchanges())

# Forex all pairs
print(finnhub_client.forex_rates(base='USD'))

# Forex symbols
print(finnhub_client.forex_symbols('OANDA'))

# Fund Ownership
print(finnhub_client.fund_ownership('AMZN', limit=5))

# General news
print(finnhub_client.general_news('forex', min_id=0))

# Investors ownership
print(finnhub_client.ownership('AAPL', limit=5))

# IPO calendar
print(finnhub_client.ipo_calendar(_from="2020-05-01", to="2020-06-01"))

# Major developments
print(finnhub_client.press_releases('AAPL', _from="2020-01-01", to="2020-12-31"))

# News sentiment
print(finnhub_client.news_sentiment('AAPL'))

# Pattern recognition
print(finnhub_client.pattern_recognition('AAPL', 'D'))

# Price target
print(finnhub_client.price_target('AAPL'))

# Quote
print(finnhub_client.quote('AAPL'))

# Recommendation trends
print(finnhub_client.recommendation_trends('AAPL'))

# Stock dividends
print(finnhub_client.stock_dividends('KO', _from='2019-01-01', to='2020-01-01'))

# Stock dividends 2
print(finnhub_client.stock_basic_dividends("KO"))

# Stock symbols
print(finnhub_client.stock_symbols('US')[0:5])

# Transcripts
print(finnhub_client.transcripts('AAPL_162777'))

# Transcripts list
print(finnhub_client.transcripts_list('AAPL'))

# Earnings Calendar
print(finnhub_client.earnings_calendar(_from="2020-06-10", to="2020-06-30", symbol="", international=False))

# Covid-19
print(finnhub_client.covid19())

# Upgrade downgrade
print(finnhub_client.upgrade_downgrade(symbol='AAPL', _from='2020-01-01', to='2020-06-30'))

# Economic code
print(finnhub_client.economic_code()[0:5])

# Economic calendar
print(finnhub_client.calendar_economic('2021-01-01', '2021-01-07'))

# Support resistance
print(finnhub_client.support_resistance('AAPL', 'D'))

# Technical Indicator
print(finnhub_client.technical_indicator(symbol="AAPL", resolution='D', _from=1583098857, to=1584308457, indicator='rsi', indicator_fields={"timeperiod": 3}))

# Stock splits
print(finnhub_client.stock_splits('AAPL', _from='2000-01-01', to='2020-01-01'))

# Forex candles
print(finnhub_client.forex_candles('OANDA:EUR_USD', 'D', 1590988249, 1591852249))

# Crypto Candles
print(finnhub_client.crypto_candles('BINANCE:BTCUSDT', 'D', 1590988249, 1591852249))

# Tick Data
print(finnhub_client.stock_tick('AAPL', '2020-03-25', 500, 0))

# BBO Data
print(finnhub_client.stock_nbbo("AAPL", "2020-03-25", 500, 0))

# Indices Constituents
print(finnhub_client.indices_const(symbol = "^GSPC"))

# Indices Historical Constituents
print(finnhub_client.indices_hist_const(symbol = "^GSPC"))

# ETFs Profile
print(finnhub_client.etfs_profile('SPY'))
print(finnhub_client.etfs_profile(isin="US78462F1030"))

# ETFs Holdings
print(finnhub_client.etfs_holdings('SPY'))
print(finnhub_client.etfs_holdings(isin="US00214Q1040", skip=2))
print(finnhub_client.etfs_holdings("IPO", date='2022-03-10'))

# ETFs Sector Exposure
print(finnhub_client.etfs_sector_exp('SPY'))

# ETFs Country Exposure
print(finnhub_client.etfs_country_exp('SPY'))

# International Filings
print(finnhub_client.international_filings('RY.TO'))
print(finnhub_client.international_filings(country='GB'))

# SEC Sentiment Analysis
print(finnhub_client.sec_sentiment_analysis('0000320193-20-000052'))

# SEC similarity index
print(finnhub_client.sec_similarity_index('AAPL'))

# Bid Ask
print(finnhub_client.last_bid_ask('AAPL'))

# FDA Calendar
print(finnhub_client.fda_calendar())

# Symbol lookup
print(finnhub_client.symbol_lookup('apple'))

# Insider transactions
print(finnhub_client.stock_insider_transactions('AAPL', '2021-01-01', '2021-03-01'))

# Mutual Funds Profile
print(finnhub_client.mutual_fund_profile("VTSAX"))
print(finnhub_client.mutual_fund_profile(isin="US9229087286"))

# Mutual Funds Holdings
print(finnhub_client.mutual_fund_holdings("VTSAX"))
print(finnhub_client.mutual_fund_holdings(isin="US9229087286", skip=2))

# Mutual Funds Sector Exposure
print(finnhub_client.mutual_fund_sector_exp("VTSAX"))

# Mutual Funds Country Exposure
print(finnhub_client.mutual_fund_country_exp("VTSAX"))

# Revenue breakdown
print(finnhub_client.stock_revenue_breakdown('AAPL'))

# Social sentiment
print(finnhub_client.stock_social_sentiment('GME'))

# Investment Themes
print(finnhub_client.stock_investment_theme('financialExchangesData'))

# Supply chain
print(finnhub_client.stock_supply_chain('AAPL'))

# Company ESG
print(finnhub_client.company_esg_score("AAPL"))

# Earnings Quality Score
print(finnhub_client.company_earnings_quality_score('AAPL', 'quarterly'))

# Crypto Profile
print(finnhub_client.crypto_profile('BTC'))

# EBITDA Estimates
print(finnhub_client.company_ebitda_estimates("TSLA", freq="quarterly"))

# EBIT Estimates
print(finnhub_client.company_ebit_estimates("TSLA", freq="quarterly"))

# USPTO Patent
print(finnhub_client.stock_uspto_patent("AAPL", "2021-01-01", "2021-12-31"))

# Visa application
print(finnhub_client.stock_visa_application("AAPL", "2021-01-01", "2022-06-15"))

# Insider sentiment
print(finnhub_client.stock_insider_sentiment('AAPL', '2021-01-01', '2022-03-01'))

# Bond Profile
print(finnhub_client.bond_profile(isin='US912810TD00'))

# Bond price
print(finnhub_client.bond_price('US912810TD00', 1590988249, 1649099548))

# Lobbying
print(finnhub_client.stock_lobbying("AAPL", "2021-01-01", "2022-06-15"))

# USA Spending
print(finnhub_client.stock_usa_spending("LMT", "2021-01-01", "2022-06-15"))

# Sector metrics
print(finnhub_client.sector_metric('NA'))

## Fund's EET data
print(finnhub_client.mutual_fund_eet('LU2036931686'))
print(finnhub_client.mutual_fund_eet_pai('LU2036931686'))

# Symbol & ISIN change
print(finnhub_client.isin_change(_from='2022-10-01', to='2022-10-07'))
print(finnhub_client.symbol_change(_from='2022-10-01', to='2022-10-07'))

# 13-F data
print(finnhub_client.institutional_profile())
print(finnhub_client.institutional_portfolio(cik='1000097', _from='2022-01-01', to='2022-10-07'))
print(finnhub_client.institutional_ownership('TSLA', '', _from='2022-01-01', to='2022-10-07'))

# Bond yield and FINRA Trace tick
print(finnhub_client.bond_yield_curve('10y'))
print(finnhub_client.bond_tick('US693475BF18', '2022-08-19', 500, 0, 'trace'))

# Congressional Trading
print(finnhub_client.congressional_trading('AAPL', '2020-01-01', '2023-03-31'))

# Price metrics with historical data
print(finnhub_client.price_metrics(symbol="AAPL", date="2022-01-01"))

## Market Holday / Status
print(finnhub_client.market_holiday(exchange='US'))
print(finnhub_client.market_status(exchange='US'))

# Bank Branch
print(finnhub_client.bank_branch("JPM"))


API Documentation
The API is organized around REST. Our API has predictable resource-oriented URLs, accepts form-encoded request bodies, returns JSON-encoded responses, and uses standard HTTP response codes, authentication, and verbs. This is 1 of the most comprehensive financial API available on the market.

Base URL: /api/v1

Swagger schema: Download





Authentication
All GET request require a token parameter token=apiKey in the URL or a header X-Finnhub-Token : apiKey. You can find your API Key under Dashboard. If you are logged in, your API key will be automatically used in the examples so you can copy and paste them as is.





Rate Limits
If your limit is exceeded, you will receive a response with status code 429.

On top of all plan's limit, there is a 30 API calls/ second limit.





FinSheet Excel & Google Sheets plugin
Finsheet is the official spreadsheet's plugin partner using fundamental data and estimates data from Finnhub. If you are looking to complement the stock price data you already got directly from Excel and Google Sheets with some advanced data, Finsheet's Excel and Google Sheets plugin offer an affordable way to access global fundamentals and estimates right in your spreadsheet.






Libraries
We have been incredibly humbled by the support of the open-source community. Beside these incredible projects, here are our own official libraries:

Language	Homepage
Python	finnhub-python
Go	finnhub-go
Javascript	Finnhub NPM
Ruby	Finnhub Ruby
Kotlin	Finnhub Kotlin
PHP	Finnhub PHP




Open Data
We understand the importance of data for students, researchers,and investors. That's why at Finnhub, we have decided to create multiple Open Datasets for the community which can be downloaded in bulk below:

Datasets	Download
SEC Financials As Reported	Kaggle
SEC Filings Metadata	Kaggle
S&P 500 futures tick data	Kaggle




Trades - Last Price Updates
Stream real-time trades for US stocks, forex and crypto. Trades might not be available for some forex and crypto exchanges. In that case, a price update will be sent with volume = 0. A message can contain multiple trades. 1 API key can only open 1 connection at a time.

The following FX brokers do not support streaming: FXCM, Forex.com, FHFX. To get latest price for FX, please use the Forex Candles or All Rates endpoint.


Method: Websocket

Examples:

wss://ws.finnhub.io

Response Attributes:

type
Message type.

data
List of trades or price updates.

s
Symbol.

p
Last price.

t
UNIX milliseconds timestamp.

v
Volume.

c
List of trade conditions. A comprehensive list of trade conditions code can be found here

Sample code

Python
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
#https://pypi.org/project/websocket_client/
import websocket

def on_message(ws, message):
    print(message)

def on_error(ws, error):
    print(error)

def on_close(ws):
    print("### closed ###")

def on_open(ws):
    ws.send('{"type":"subscribe","symbol":"AAPL"}')
    ws.send('{"type":"subscribe","symbol":"AMZN"}')
    ws.send('{"type":"subscribe","symbol":"BINANCE:BTCUSDT"}')
    ws.send('{"type":"subscribe","symbol":"IC MARKETS:1"}')

if __name__ == "__main__":
    websocket.enableTrace(True)
    ws = websocket.WebSocketApp("wss://ws.finnhub.io?token=",
                              on_message = on_message,
                              on_error = on_error,
                              on_close = on_close)
    ws.on_open = on_open
    ws.run_forever()



Sample response
1
2
3
4
5
6
7
8
9
10
11
{
  "data": [
    {
      "p": 7296.89,
      "s": "BINANCE:BTCUSDT",
      "t": 1575526691134,
      "v": 0.011467
    }
  ],
  "type": "trade"
}

News Premium
Stream real-time news for US and Canadian stocks.

Method: Websocket

Premium: Premium Access Required

Examples:

wss://ws.finnhub.io

Response Attributes:

type
Message type: news.

data
List of news.

category
News category.

datetime
Published time in UNIX timestamp.

headline
News headline.

urlId
News ID.

image
Thumbnail image URL.

related
Related stocks and companies mentioned in the article.

source
News source.

summary
News summary.

url
URL of the original article.

Sample code

Python
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
#https://pypi.org/project/websocket_client/
import websocket

def on_message(ws, message):
    print(message)

def on_error(ws, error):
    print(error)

def on_close(ws):
    print("### closed ###")

def on_open(ws):
    ws.send('{"type":"subscribe-news","symbol":"AAPL"}')
    ws.send('{"type":"subscribe-news","symbol":"AMZN"}')
    ws.send('{"type":"subscribe-news","symbol":"MSFT"}')
    ws.send('{"type":"subscribe-news","symbol":"BYND"}')

if __name__ == "__main__":
    websocket.enableTrace(True)
    ws = websocket.WebSocketApp("wss://ws.finnhub.io?token=",
                              on_message = on_message,
                              on_error = on_error,
                              on_close = on_close)
    ws.on_open = on_open
    ws.run_forever()



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
{
  "data": [
    {
      "category": "company",
      "datetime": 1679920200,
      "headline": "CanAlaska Uranium Announces Airborne Electromagnetic Survey Completed at Geikie Project in Athabasca Basin",
      "id": 119440189,
      "image": "https://media.zenfs.com/en/newsfile_64/0522ee5d9e134e6f966c6ecdfc50fb46",
      "related": "CVVUF",
      "source": "Yahoo",
      "summary": "Multiple Priority Targets Associated with Regional Scale Fault Structures Preparation Underway for First Drill ProgramDrilling Continues at West McArthur JV and Key Extension ProjectsVancouver, British Columbia--(Newsfile Corp. - March 27, 2023) - CanAlaska Uranium Ltd. (TSXV: CVV) (OTCQX: CVVUF) (FSE: DH7N) (\"CanAlaska\" or the \"Company\") is pleased to announce completion of a high-resolution airborne Versatile Time Domain Electromagnetic (\"VTEM Plus\") survey on it's 60%-owned Geikie project in",
      "url": "https://finance.yahoo.com/news/canalaska-uranium-announces-airborne-electromagnetic-123000318.html"
    }
  ],
  "type": "news"
}

Press Releases Premium
Stream real-time press releases data for global companies. This feature is only available for Enterprise users.

Method: Websocket

Premium: Premium Access Required

Examples:

wss://ws.finnhub.io

Response Attributes:

type
Message type: news.

data
List of news.

datetime
Published time in UNIX timestamp.

headline
News headline.

symbol
Related stocks and companies mentioned in the article.

fullText
URL to download the full-text data.

url
URL to read the article.

Sample code

Python
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
#https://pypi.org/project/websocket_client/
import websocket

def on_message(ws, message):
    print(message)

def on_error(ws, error):
    print(error)

def on_close(ws):
    print("### closed ###")

def on_open(ws):
    ws.send('{"type":"subscribe-pr","symbol":"AAPL"}')
    ws.send('{"type":"subscribe-pr","symbol":"AMZN"}')
    ws.send('{"type":"subscribe-pr","symbol":"MSFT"}')
    ws.send('{"type":"subscribe-pr","symbol":"BYND"}')

if __name__ == "__main__":
    websocket.enableTrace(True)
    ws = websocket.WebSocketApp("wss://ws.finnhub.io?token=",
                              on_message = on_message,
                              on_error = on_error,
                              on_close = on_close)
    ws.on_open = on_open
    ws.run_forever()



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
{
  "data": [
    {
      "datetime": 1637696940,
      "fullText": "https://static2.finnhub.io/file/publicdatany/pr/0eb7fb4118ec53204755719b4cc4d57e9370d3caa2fa15d5e7a8f3b4d99cc881.html",
      "headline": "STOCKHOLDER ALERT: Monteverde &amp; Associates PC Continues to Investigate the Following Merger",
      "symbol": "PAE,ZIXI,KRA",
      "url": "https://finnhub.io/api/press-releases?id=0eb7fb4118ec53204755719b4cc4d57e9370d3caa2fa15d5e7a8f3b4d99cc881"
    }
  ],
  "type": "pr"
}

Symbol Lookup
Search for best-matching symbols based on your query. You can input anything from symbol, security's name to ISIN and Cusip.

Method: GET

Examples:

/search?q=apple&exchange=US

/search?q=US5949181045

Arguments:

qREQUIRED
Query text can be symbol, name, isin, or cusip.

exchangeoptional
Exchange limit.

Response Attributes:

count
Number of results.

result
Array of search results.

description
Symbol description

displaySymbol
Display symbol name.

symbol
Unique symbol used to identify this symbol used in /stock/candle endpoint.

type
Security type.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.symbol_lookup('apple'))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
{
  "count": 4,
  "result": [
    {
      "description": "APPLE INC",
      "displaySymbol": "AAPL",
      "symbol": "AAPL",
      "type": "Common Stock"
    },
    {
      "description": "APPLE INC",
      "displaySymbol": "AAPL.SW",
      "symbol": "AAPL.SW",
      "type": "Common Stock"
    },
    {
      "description": "APPLE INC",
      "displaySymbol": "APC.BE",
      "symbol": "APC.BE",
      "type": "Common Stock"
    },
    {
      "description": "APPLE INC",
      "displaySymbol": "APC.DE",
      "symbol": "APC.DE",
      "type": "Common Stock"
    }
  ]
}

Stock Symbol
List supported stocks. We use the following symbology to identify stocks on Finnhub Exchange_Ticker.Exchange_Code. A list of supported exchange codes can be found here.

Method: GET

Examples:

/stock/symbol?exchange=US

/stock/symbol?exchange=US&mic=XNYS

Arguments:

exchangeREQUIRED
Exchange you want to get the list of symbols from. List of exchange codes can be found here.

micoptional
Filter by MIC code.

securityTypeoptional
Filter by security type used by OpenFigi standard.

currencyoptional
Filter by currency.

Response Attributes:

currency
Price's currency. This might be different from the reporting currency of fundamental data.

description
Symbol description

displaySymbol
Display symbol name.

figi
FIGI identifier.

isin
ISIN. This field is only available for EU stocks and selected Asian markets. Entitlement from Finnhub is required to access this field.

mic
Primary exchange's MIC.

shareClassFIGI
Global Share Class FIGI.

symbol
Unique symbol used to identify this symbol used in /stock/candle endpoint.

symbol2
Alternative ticker for exchanges with multiple tickers for 1 stock such as BSE.

type
Security type.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.stock_symbols('US'))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
[
  {
    "currency": "USD",
    "description": "UAN POWER CORP",
    "displaySymbol": "UPOW",
    "figi": "BBG000BGHYF2",
    "mic": "OTCM",
    "symbol": "UPOW",
    "type": "Common Stock"
  },
  {
    "currency": "USD",
    "description": "APPLE INC",
    "displaySymbol": "AAPL",
    "figi": "BBG000B9Y5X2",
    "mic": "XNGS",
    "symbol": "AAPL",
    "type": "Common Stock"
  },
  {
    "currency": "USD",
    "description": "EXCO TECHNOLOGIES LTD",
    "displaySymbol": "EXCOF",
    "figi": "BBG000JHDDS8",
    "mic": "OOTC",
    "symbol": "EXCOF",
    "type": "Common Stock"
  }
]

Market Status
Get current market status for global exchanges (whether exchanges are open or close).

Method: GET

Examples:

/stock/market-status?exchange=US

/stock/market-status?exchange=L

Arguments:

exchangeREQUIRED
Exchange code.

Response Attributes:

exchange
Exchange.

holiday
Holiday event.

isOpen
Whether the market is open at the moment.

session
Market session. Can be 1 of the following values: pre-market,regular,post-market or null if the market is closed.

t
Current timestamp.

timezone
Timezone.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.market_status(exchange='US'))



Sample response
1
2
3
4
5
6
7
8
{
  "exchange": "US",
  "holiday": null,
  "isOpen": false,
  "session": "pre-market",
  "timezone": "America/New_York",
  "t": 1697018041
}

Market Holiday
Get a list of holidays for global exchanges.

Method: GET

Examples:

/stock/market-holiday?exchange=US

/stock/market-holiday?exchange=L

Arguments:

exchangeREQUIRED
Exchange code.

Response Attributes:

data
Array of holidays.

atDate
Date.

eventName
Holiday's name.

tradingHour
Trading hours for this day if the market is partially closed only.

exchange
Exchange.

timezone
Timezone.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.market_holiday(exchange='US'))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
{
  "data": [
    {
      "eventName": "Christmas",
      "atDate": "2023-12-25",
      "tradingHour": ""
    },
    {
      "eventName": "Independence Day",
      "atDate": "2023-07-03",
      "tradingHour": "09:30-13:00"
    }
  ],
  "exchange": "US",
  "timezone": "America/New_York"
}

Company Profile Premium
Get general information of a company. You can query by symbol, ISIN or CUSIP

Method: GET

Premium: Premium Access Required

Examples:

/stock/profile?symbol=AAPL

/stock/profile?symbol=IBM

/stock/profile?isin=US5949181045

/stock/profile?cusip=023135106

Arguments:

symboloptional
Symbol of the company: AAPL e.g.

isinoptional
ISIN

cusipoptional
CUSIP

Response Attributes:

address
Address of company's headquarter.

alias
Company name alias.

city
City of company's headquarter.

country
Country of company's headquarter.

currency
Currency used in company filings and financials.

cusip
CUSIP number.

description
Company business summary.

employeeTotal
Number of employee.

estimateCurrency
Currency used in Estimates data.

exchange
Listed exchange.

finnhubIndustry
Finnhub industry classification.

ggroup
Industry group.

gind
Industry.

gsector
Sector.

gsubind
Sub-industry.

ipo
IPO date.

irUrl
Investor relations website.

isin
ISIN number.

lei
LEI number.

logo
Logo image.

marketCapCurrency
Currency used in market capitalization.

marketCapitalization
Market Capitalization.

naics
NAICS industry.

naicsNationalIndustry
NAICS national industry.

naicsSector
NAICS sector.

naicsSubsector
NAICS subsector.

name
Company name.

phone
Company phone number.

sedol
Sedol number.

shareOutstanding
Number of oustanding shares.

state
State of company's headquarter.

ticker
Company symbol/ticker as used on the listed exchange.

weburl
Company website.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.company_profile(symbol='AAPL'))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
{
  "address": "1 Apple Park Way",
  "city": "CUPERTINO",
  "country": "US",
  "currency": "USD",
  "cusip": "",
  "sedol":"2046251",
  "description": "Apple Inc. is an American multinational technology company headquartered in Cupertino, California, that designs, develops, and sells consumer electronics, computer software, and online services. It is considered one of the Big Four technology companies, alongside Amazon, Google, and Microsoft. The company's hardware products include the iPhone smartphone, the iPad tablet computer, the Mac personal computer, the iPod portable media player, the Apple Watch smartwatch, the Apple TV digital media player, the AirPods wireless earbuds and the HomePod smart speaker. Apple's software includes the macOS, iOS, iPadOS, watchOS, and tvOS operating systems, the iTunes media player, the Safari web browser, the Shazam acoustic fingerprint utility, and the iLife and iWork creativity and productivity suites, as well as professional applications like Final Cut Pro, Logic Pro, and Xcode. Its online services include the iTunes Store, the iOS App Store, Mac App Store, Apple Music, Apple TV+, iMessage, and iCloud. Other services include Apple Store, Genius Bar, AppleCare, Apple Pay, Apple Pay Cash, and Apple Card.",
  "employeeTotal": "137000",
  "exchange": "NASDAQ/NMS (GLOBAL MARKET)",
  "ggroup": "Technology Hardware & Equipment",
  "gind": "Technology Hardware, Storage & Peripherals",
  "gsector": "Information Technology",
  "gsubind": "Technology Hardware, Storage & Peripherals",
  "ipo": "1980-12-12",
  "isin": "",
  "marketCapitalization": 1415993,
  "naics": "Communications Equipment Manufacturing",
  "naicsNationalIndustry": "Radio and Television Broadcasting and Wireless Communications Equipment Manufacturing",
  "naicsSector": "Manufacturing",
  "naicsSubsector": "Computer and Electronic Product Manufacturing",
  "name": "Apple Inc",
  "phone": "14089961010",
  "shareOutstanding": 4375.47998046875,
  "state": "CALIFORNIA",
  "ticker": "AAPL",
  "weburl": "https://www.apple.com/",
  "logo": "https://static.finnhub.io/logo/87cb30d8-80df-11ea-8951-00000000092a.png",
  "finnhubIndustry":"Technology"
}

Company Profile 2
Get general information of a company. You can query by symbol, ISIN or CUSIP. This is the free version of Company Profile.

Method: GET

Examples:

/stock/profile2?symbol=AAPL

/stock/profile2?isin=US5949181045

/stock/profile2?cusip=023135106

Arguments:

symboloptional
Symbol of the company: AAPL e.g.

isinoptional
ISIN

cusipoptional
CUSIP

Response Attributes:

country
Country of company's headquarter.

currency
Currency used in company filings.

exchange
Listed exchange.

finnhubIndustry
Finnhub industry classification.

ipo
IPO date.

logo
Logo image.

marketCapitalization
Market Capitalization.

name
Company name.

phone
Company phone number.

shareOutstanding
Number of oustanding shares.

ticker
Company symbol/ticker as used on the listed exchange.

weburl
Company website.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.company_profile2(symbol='AAPL'))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
{
  "country": "US",
  "currency": "USD",
  "exchange": "NASDAQ/NMS (GLOBAL MARKET)",
  "ipo": "1980-12-12",
  "marketCapitalization": 1415993,
  "name": "Apple Inc",
  "phone": "14089961010",
  "shareOutstanding": 4375.47998046875,
  "ticker": "AAPL",
  "weburl": "https://www.apple.com/",
  "logo": "https://static.finnhub.io/logo/87cb30d8-80df-11ea-8951-00000000092a.png",
  "finnhubIndustry":"Technology"
}

Company Executive Premium
Get a list of company's executives and members of the Board.

Method: GET

Premium: Premium Access Required

Examples:

/stock/executive?symbol=AAPL

/stock/executive?symbol=AMZN

Arguments:

symbolREQUIRED
Symbol of the company: AAPL.

Response Attributes:

executive
Array of company's executives and members of the Board.

age
Age

compensation
Total compensation

currency
Compensation currency

name
Executive name

sex
Sex

since
Year first appointed as executive/director of the company

title
Title

symbol
Company symbol.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.company_executive('AAPL'))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
{
  "executive": [
    {
      "age": 56,
      "compensation": 25209637,
      "currency": "USD",
      "name": "Luca Maestri",
      "position": "Senior Vice President and Chief Financial Officer",
      "sex": "male",
      "since": "2014"
    },
    {
      "age": 59,
      "compensation": 11555466,
      "currency": "USD",
      "name": "Mr. Timothy Cook",
      "position": "Director and Chief Executive Officer",
      "sex": "male",
      "since": "2011"
    }
  ]
}

Market News
Get latest market news.

Method: GET

Examples:

/news?category=general

/news?category=forex&minId=10

Arguments:

categoryREQUIRED
This parameter can be 1 of the following values general, forex, crypto, merger.

minIdoptional
Use this field to get only news after this ID. Default to 0

Response Attributes:

category
News category.

datetime
Published time in UNIX timestamp.

headline
News headline.

id
News ID. This value can be used for minId params to get the latest news only.

image
Thumbnail image URL.

related
Related stocks and companies mentioned in the article.

source
News source.

summary
News summary.

url
URL of the original article.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.general_news('general', min_id=0))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
[
  {
    "category": "technology",
    "datetime": 1596589501,
    "headline": "Square surges after reporting 64% jump in revenue, more customers using Cash App",
    "id": 5085164,
    "image": "https://image.cnbcfm.com/api/v1/image/105569283-1542050972462rts25mct.jpg?v=1542051069",
    "related": "",
    "source": "CNBC",
    "summary": "Shares of Square soared on Tuesday evening after posting better-than-expected quarterly results and strong growth in its consumer payments app.",
    "url": "https://www.cnbc.com/2020/08/04/square-sq-earnings-q2-2020.html"
  },
  {
    "category": "business",
    "datetime": 1596588232,
    "headline": "B&G Foods CEO expects pantry demand to hold up post-pandemic",
    "id": 5085113,
    "image": "https://image.cnbcfm.com/api/v1/image/106629991-1595532157669-gettyimages-1221952946-362857076_1-5.jpeg?v=1595532242",
    "related": "",
    "source": "CNBC",
    "summary": "\"I think post-Covid, people will be working more at home, which means people will be eating more breakfast\" and other meals at home, B&G CEO Ken Romanzi said.",
    "url": "https://www.cnbc.com/2020/08/04/bg-foods-ceo-expects-pantry-demand-to-hold-up-post-pandemic.html"
  },
  {
    "category": "top news",
    "datetime": 1596584406,
    "headline": "Anthony Levandowski gets 18 months in prison for stealing Google self-driving car files",
    "id": 5084850,
    "image": "https://image.cnbcfm.com/api/v1/image/106648265-1596584130509-UBER-LEVANDOWSKI.JPG?v=1596584247",
    "related": "",
    "source": "CNBC",
    "summary": "A U.S. judge on Tuesday sentenced former Google engineer Anthony Levandowski to 18 months in prison for stealing a trade secret from Google related to self-driving cars months before becoming the head of Uber Technologies Inc's rival unit.",
    "url": "https://www.cnbc.com/2020/08/04/anthony-levandowski-gets-18-months-in-prison-for-stealing-google-self-driving-car-files.html"
  }
  }]

Company News
List latest company news by symbol. This endpoint is only available for North American companies.

Method: GET

Free Tier: 1 year of historical news and new updates

Examples:

/company-news?symbol=AAPL&from=2025-01-15&to=2025-02-20

Arguments:

symbolREQUIRED
Company symbol.

fromREQUIRED
From date YYYY-MM-DD.

toREQUIRED
To date YYYY-MM-DD.

Response Attributes:

category
News category.

datetime
Published time in UNIX timestamp.

headline
News headline.

id
News ID. This value can be used for minId params to get the latest news only.

image
Thumbnail image URL.

related
Related stocks and companies mentioned in the article.

source
News source.

summary
News summary.

url
URL of the original article.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.company_news('AAPL', _from="2020-06-01", to="2020-06-10"))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
[
  {
    "category": "company news",
    "datetime": 1569550360,
    "headline": "More sops needed to boost electronic manufacturing: Top govt official More sops needed to boost electronic manufacturing: Top govt official.  More sops needed to boost electronic manufacturing: Top govt official More sops needed to boost electronic manufacturing: Top govt official",
    "id": 25286,
    "image": "https://img.etimg.com/thumb/msid-71321314,width-1070,height-580,imgsize-481831,overlay-economictimes/photo.jpg",
    "related": "AAPL",
    "source": "The Economic Times India",
    "summary": "NEW DELHI | CHENNAI: India may have to offer electronic manufacturers additional sops such as cheap credit and incentives for export along with infrastructure support in order to boost production and help the sector compete with China, Vietnam and Thailand, according to a top government official.These incentives, over and above the proposed reduction of corporate tax to 15% for new manufacturing units, are vital for India to successfully attract companies looking to relocate manufacturing facilities.“While the tax announcements made last week send a very good signal, in order to help attract investments, we will need additional initiatives,” the official told ET, pointing out that Indian electronic manufacturers incur 8-10% higher costs compared with other Asian countries.Sops that are similar to the incentives for export under the existing Merchandise Exports from India Scheme (MEIS) are what the industry requires, the person said.MEIS gives tax credit in the range of 2-5%. An interest subvention scheme for cheaper loans and a credit guarantee scheme for plant and machinery are some other possible measures that will help the industry, the official added.“This should be 2.0 (second) version of the electronic manufacturing cluster (EMC) scheme, which is aimed at creating an ecosystem with an anchor company plus its suppliers to operate in the same area,” he said.Last week, finance minister Nirmala Sitharaman announced a series of measures to boost economic growth including a scheme allowing any new manufacturing company incorporated on or after October 1, to pay income tax at 15% provided the company does not avail of any other exemption or incentives.",
    "url": "https://economictimes.indiatimes.com/industry/cons-products/electronics/more-sops-needed-to-boost-electronic-manufacturing-top-govt-official/articleshow/71321308.cms"
  },
  {
    "category": "company news",
    "datetime": 1569528720,
    "headline": "How to disable comments on your YouTube videos in 2 different ways",
    "id": 25287,
    "image": "https://amp.businessinsider.com/images/5d8d16182e22af6ab66c09e9-1536-768.jpg",
    "related": "AAPL",
    "source": "Business Insider",
    "summary": "You can disable comments on your own YouTube video if you don't want people to comment on it. It's easy to disable comments on YouTube by adjusting the settings for one of your videos in the beta or classic version of YouTube Studio. Visit Business Insider's homepage for more stories . The comments section has a somewhat complicated reputation for creators, especially for those making videos on YouTube . While it can be useful to get the unfiltered opinions of your YouTube viewers and possibly forge a closer connection with them, it can also open you up to quite a bit of negativity. So it makes sense that there may be times when you want to turn off the feature entirely. Just keep in mind that the action itself can spark conversation. If you decide that you don't want to let people leave comments on your YouTube video, here's how to turn off the feature, using either the classic or beta version of the creator studio: How to disable comments on YouTube in YouTube Studio (beta) 1. Go to youtube.com and log into your account, if necessary. 2.",
    "url": "https://www.businessinsider.com/how-to-disable-comments-on-youtube"
  },
  {
    "category": "company news",
    "datetime": 1569526180,
    "headline": "Apple iPhone 11 Pro Teardowns Look Encouraging for STMicro and Sony",
    "id": 25341,
    "image": "http://s.thestreet.com/files/tsc/v2008/photos/contrib/uploads/ba140938-d409-11e9-822b-fda891ce1fc1.png",
    "related": "AAPL",
    "source": "TheStreet",
    "summary": "STMicroelectronics and Sony each appear to be supplying four chips for Apple's latest flagship iPhones. Many other historical iPhone suppliers also make appearances in the latest teardowns….STM",
    "url": "https://realmoney.thestreet.com/investing/technology/iphone-11-pro-teardowns-look-encouraging-for-stmicro-sony-15105767"
  },
]

Major Press Releases Premium
Get latest major press releases of a company. This data can be used to highlight the most significant events comprised of mostly press releases sourced from the exchanges, BusinessWire, AccessWire, GlobeNewswire, Newsfile, and PRNewswire.

Full-text press releases data is available for Enterprise clients. Contact Us to learn more.


Method: GET

Premium: Premium Access Required

Examples:

/press-releases?symbol=AAPL

/press-releases?symbol=IBM&from=2019-11-01&to=2020-02-15

Arguments:

symbolREQUIRED
Company symbol.

fromoptional
From time: 2020-01-01.

tooptional
To time: 2020-01-05.

Response Attributes:

majorDevelopment
Array of major developments.

datetime
Published time in YYYY-MM-DD HH:MM:SS format.

description
Development description.

headline
Development headline.

symbol
Company symbol.

url
URL.

symbol
Company symbol.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.press_releases('AAPL'))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
{
  "majorDevelopment": [
    {
      "symbol": "AAPL",
      "datetime": "2020-08-04 17:06:32",
      "headline": "27-inch iMac Gets a Major Update",
      "description": "CUPERTINO, Calif.--(BUSINESS WIRE)-- Apple today announced a major update to its 27-inch iMac®. By far the most powerful and capable iMac ever, it features faster Intel processors up to 10 cores, double the memory capacity, next-generation AMD graphics, superfast SSDs across the line with four times the storage capacity, a new nano-texture glass option for an even more stunning Retina® 5K display, a 1080p FaceTime® HD camera, higher fidelity speakers, and studio-quality mics. For the consumer using their iMac all day, every day, to the aspiring creative looking for inspiration, to the serious pro pushing the limits of their creativity, the new 27-inch iMac delivers the ultimate desktop experience that is now better in every way."
    },
    {
      "symbol": "AAPL",
      "datetime": "2020-03-28 09:41:23",
      "headline": "Apple Central World Opens Friday in Thailand",
      "description": "BANGKOK--(BUSINESS WIRE)-- Apple® today previewed Apple Central World, its second and largest retail location in Thailand. Nestled in the heart of Ratchaprasong, Bangkok’s iconic intersection, the store provides a completely new and accessible destination within the lively city. Apple Central World’s distinctive architecture is brought to life with the first-ever all-glass design, housed under a cantilevered Tree Canopy roof. Once inside, customers can travel between two levels via a spiral staircase that wraps around a timber core, or riding a unique cylindrical elevator clad in mirror-polished stainless steel. Guests can enter from the ground or upper level, which provides a direct connection to the Skytrain and the city’s largest shopping center. The outdoor plaza offers a place for the community to gather, with benches and large Terminalia trees surrounding the space."
    }
  ],
   "symbol": "AAPL"
}

News Sentiment Premium
Get company's news sentiment and statistics. This endpoint is only available for US companies.

Method: GET

Premium: Premium Access Required

Examples:

/news-sentiment?symbol=V

/news-sentiment?symbol=AAPL

Arguments:

symbolREQUIRED
Company symbol.

Response Attributes:

buzz
Statistics of company news in the past week.

articlesInLastWeek
buzz
weeklyAverage
companyNewsScore
News score.

sectorAverageBullishPercent
Sector average bullish percent.

sectorAverageNewsScore
Sectore average score.

sentiment
News sentiment.

bearishPercent
bullishPercent
symbol
Requested symbol.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.news_sentiment('AAPL'))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
{
  "buzz": {
    "articlesInLastWeek": 20,
    "buzz": 0.8888,
    "weeklyAverage": 22.5
  },
  "companyNewsScore": 0.9166,
  "sectorAverageBullishPercent": 0.6482,
  "sectorAverageNewsScore": 0.5191,
  "sentiment": {
    "bearishPercent": 0,
    "bullishPercent": 1
  },
  "symbol": "V"
}

Peers
Get company peers. Return a list of peers operating in the same country and sector/industry.

Method: GET

Examples:

/stock/peers?symbol=AAPL

/stock/peers?symbol=F&grouping=industry

Arguments:

symbolREQUIRED
Symbol of the company: AAPL.

groupingoptional
Specify the grouping criteria for choosing peers.Supporter values: sector, industry, subIndustry. Default to subIndustry.

Response Attributes:

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.company_peers('AAPL'))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
[
  "AAPL",
  "EMC",
  "HPQ",
  "DELL",
  "WDC",
  "HPE",
  "NTAP",
  "CPQ",
  "SNDK",
  "SEG"
]

Basic Financials
Get company basic financials such as margin, P/E ratio, 52-week high/low etc.

Method: GET

Examples:

/stock/metric?symbol=AAPL&metric=all

Arguments:

symbolREQUIRED
Symbol of the company: AAPL.

metricREQUIRED
Metric type. Can be 1 of the following values all

Response Attributes:

metric
Map key-value pair of key ratios and metrics.

metricType
Metric type.

series
Map key-value pair of time-series ratios.

symbol
Symbol of the company.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.company_basic_financials('AAPL', 'all'))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
{
   "series": {
    "annual": {
      "currentRatio": [
        {
          "period": "2019-09-28",
          "v": 1.5401
        },
        {
          "period": "2018-09-29",
          "v": 1.1329
        }
      ],
      "salesPerShare": [
        {
          "period": "2019-09-28",
          "v": 55.9645
        },
        {
          "period": "2018-09-29",
          "v": 53.1178
        }
      ],
      "netMargin": [
        {
          "period": "2019-09-28",
          "v": 0.2124
        },
        {
          "period": "2018-09-29",
          "v": 0.2241
        }
      ]
    }
  },
  "metric": {
    "10DayAverageTradingVolume": 32.50147,
    "52WeekHigh": 310.43,
    "52WeekLow": 149.22,
    "52WeekLowDate": "2019-01-14",
    "52WeekPriceReturnDaily": 101.96334,
    "beta": 1.2989,
  },
  "metricType": "all",
  "symbol": "AAPL"
}

Ownership Premium
Get a full list of shareholders of a company in descending order of the number of shares held. Data is sourced from 13F form, Schedule 13D and 13G for US market, UK Share Register for UK market, SEDI for Canadian market and equivalent filings for other international markets.

Method: GET

Premium: Premium Access Required

Examples:

/stock/ownership?symbol=AAPL&limit=20

/stock/ownership?symbol=IBM

Arguments:

symbolREQUIRED
Symbol of the company: AAPL.

limitoptional
Limit number of results. Leave empty to get the full list.

Response Attributes:

ownership
Array of investors with detailed information about their holdings.

change
Number of share changed (net buy or sell) from the last period.

filingDate
Filing date.

name
Investor's name.

share
Number of shares held by the investor.

symbol
Symbol of the company.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.ownership('AAPL', limit=5))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
{
  "ownership": [
    {
      "name": "The Vanguard Group, Inc.",
      "share": 329323420,
      "change": -1809077,
      "filingDate": "2019-12-31"
    },
    {
      "name": "BRK.A | Berkshire Hathaway Inc.",
      "share": 245155570,
      "change": -3683113,
      "filingDate": "2019-12-31"
    },
    {
      "name": "BlackRock Institutional Trust Co NA",
      "share": 187354850,
      "change": -2500563,
      "filingDate": "2020-03-31"
    }
  ],
  "symbol": "AAPL"
}

Fund Ownership Premium
Get a full list fund and institutional investors of a company in descending order of the number of shares held. Data is sourced from 13F form, Schedule 13D and 13G for US market, UK Share Register for UK market, SEDI for Canadian market and equivalent filings for other international markets.

Method: GET

Premium: Premium Access Required

Examples:

/stock/fund-ownership?symbol=TSLA&limit=20

Arguments:

symbolREQUIRED
Symbol of the company: AAPL.

limitoptional
Limit number of results. Leave empty to get the full list.

Response Attributes:

ownership
Array of investors with detailed information about their holdings.

change
Number of share changed (net buy or sell) from the last period.

filingDate
Filing date.

name
Investor's name.

portfolioPercent
Percent of the fund's portfolio comprised of the company's share.

share
Number of shares held by the investor.

symbol
Symbol of the company.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.fund_ownership('AAPL', limit=5))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
{
  "ownership": [
    {
      "name": "AGTHX | American Funds Growth Fund of America",
      "share": 5145353,
      "change": 57427,
      "filingDate": "2020-03-31",
      "portfolioPercent": 1.88
    },
    {
      "name": "Vanguard Total Stock Market Index Fund",
      "share": 4227464,
      "change": 73406,
      "filingDate": "2020-03-31",
      "portfolioPercent": 0.45
    },
    {
      "name": "ANWPX | American Funds New Perspective",
      "share": 3377612,
      "change": 0,
      "filingDate": "2020-03-31",
      "portfolioPercent": 2.64
    }
  ],
  "symbol": "TSLA"
}

Institutional Profile Premium
Get a list of well-known institutional investors. Currently support 60+ profiles.

Method: GET

Premium: Premium Access Required

Examples:

/institutional/profile

Arguments:

cikoptional
Filter by CIK. Leave blank to get the full list.

Response Attributes:

cik
CIK.

data
Array of investors.

cik
Investor's company CIK.

firmType
Firm type.

manager
Manager.

philosophy
Investing philosophy.

profile
Profile info.

profileImg
Profile image.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.institutional_profile()



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
{
  "cik": "1067983",
  "data": [
    {
      "cik": "1067983",
      "firmType": "Institutional Investment Manager",
      "manager": "Warren Buffett",
      "philosophy": "Value investing is the hallmark of Warren Buffett's investment approach. By choosing stocks whose share price is below their intrinsic or book value, value investors can increase their returns. This suggests that the stock will increase in value going forward and that the market is now undervaluing it. Only enterprises that Buffett is familiar with are chosen for investment by Berkshire, and a safety margin is always required.",
      "profile": "Warren Edward Buffett (born August 30, 1930) is an American business magnate, investor, and philanthropist. He is currently the chairman and CEO of Berkshire Hathaway. He is one of the most successful investors in the world and has a net worth of over $103 billion as of August 2022, making him the world's seventh-wealthiest person. Buffett has been the chairman and largest shareholder of Berkshire Hathaway since 1970. He has been referred to as the \"Oracle\" or \"Sage\" of Omaha by global media. He is noted for his adherence to value investing, and his personal frugality despite his immense wealth. Buffett is a philanthropist, having pledged to give away 99 percent of his fortune to philanthropic causes, primarily via the Bill \u0026 Melinda Gates Foundation. He founded The Giving Pledge in 2010 with Bill Gates, whereby billionaires pledge to give away at least half of their fortunes.",
      "profileImg": "https://static4.finnhub.io/file/publicdatany5/guru_profile_pic/1067983.jpg"
    }
  ]
}

Institutional Portfolio Premium
Get the holdings/portfolio data of institutional investors from 13-F filings. Limit to 1 year of data at a time. You can get a list of supported CIK here.

Method: GET

Premium: Premium Access Required

Examples:

/institutional/portfolio?cik=1000097&from=2022-05-01&to=2022-09-01

Arguments:

cikREQUIRED
Fund's CIK.

fromREQUIRED
From date YYYY-MM-DD.

toREQUIRED
To date YYYY-MM-DD.

Response Attributes:

cik
CIK.

data
Array of positions.

filingDate
Filing date.

portfolio
Array of positions.

change
Number of shares change.

cusip
CUSIP.

name
Position's name.

noVoting
Number of shares with no voting rights.

percentage
Percentage of portfolio.

putCall
put or call for options.

share
Number of shares.

sharedVoting
Number of shares with shared voting rights.

soleVoting
Number of shares with sole voting rights.

symbol
Symbol.

value
Position value.

reportDate
Report date.

name
Investor's name.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.institutional_portfolio(cik="1000097", _from="2022-10-01", to="2022-10-11"))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
{
  "cik": "1000097",
  "data": [
    {
      "filingDate": "2022-06-30",
      "portfolio": [
        {
          "change": -41600,
          "name": "ABBOTT LABS",
          "noVoting": 0,
          "percentage": 0,
          "putCall": "",
          "share": 0,
          "sharedVoting": 0,
          "soleVoting": 41600,
          "symbol": "ABT",
          "value": 0
        },
        {
          "change": -275000,
          "name": "ADICET BIO INC",
          "noVoting": 0,
          "percentage": 0,
          "putCall": "",
          "share": 0,
          "sharedVoting": 0,
          "soleVoting": 275000,
          "symbol": "ACET",
          "value": 0
        }
      ],
      "reportDate": "2022-06-30"
    }
  ],
  "name": "KINGDON CAPITAL MANAGEMENT, L.L.C."
}

Institutional Ownership Premium
Get a list institutional investors' positions for a particular stock overtime. Data from 13-F filings. Limit to 1 year of data at a time.

Method: GET

Premium: Premium Access Required

Examples:

/institutional/ownership?symbol=TSLA&from=2022-09-01&to=2022-10-30

Arguments:

symbolREQUIRED
Filter by symbol.

cusipREQUIRED
Filter by CUSIP.

fromREQUIRED
From date YYYY-MM-DD.

toREQUIRED
To date YYYY-MM-DD.

Response Attributes:

cusip
Cusip.

data
Array of institutional investors.

ownership
Array of institutional investors.

change
Number of shares change.

cik
Investor's company CIK.

name
Firm's name.

noVoting
Number of shares with no voting rights.

percentage
Percentage of portfolio.

putCall
put or call for options.

share
News score.

sharedVoting
Number of shares with shared voting rights.

soleVoting
Number of shares with sole voting rights.

value
Position value.

reportDate
Report date.

symbol
Symbol.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.institutional_ownership(symbol="TSLA", cusip="", _from="2022-10-01", to="2022-10-11"))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
{
  "cusip": "023135106",
  "data": [
    {
      "ownership": [
        {
          "change": null,
          "cik": "1000097",
          "name": "KINGDON CAPITAL MANAGEMENT, L.L.C.",
          "noVoting": 0,
          "percentage": 6.23893,
          "putCall": "",
          "share": 11250,
          "sharedVoting": 0,
          "soleVoting": 11250,
          "value": 36674000
        }
      ],
      "reportDate": "2022-03-31"
    }
  ],
  "symbol": "AMZN"
}

Insider Transactions
Company insider transactions data sourced from Form 3,4,5, SEDI and relevant companies' filings. This endpoint covers US, UK, Canada, Australia, India, and all major EU markets. Limit to 100 transactions per API call.

Method: GET

Examples:

/stock/insider-transactions?symbol=TSLA&limit=20

/stock/insider-transactions?symbol=AC.TO

Arguments:

symbolREQUIRED
Symbol of the company: AAPL. Leave this param blank to get the latest transactions.

fromoptional
From date: 2020-03-15.

tooptional
To date: 2020-03-16.

Response Attributes:

data
Array of insider transactions.

change
Number of share changed from the last period. A positive value suggests a BUY transaction. A negative value suggests a SELL transaction.

filingDate
Filing date.

name
Insider's name.

share
Number of shares held after the transaction.

symbol
Symbol.

transactionCode
Transaction code. A list of codes and their meanings can be found here.

transactionDate
Transaction date.

transactionPrice
Average transaction price.

symbol
Symbol of the company.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.stock_insider_transactions('AAPL', '2021-01-01', '2021-03-01'))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
{
  "data": [
    {
      "name": "Kirkhorn Zachary",
      "share": 57234,
      "change": -1250,
      "filingDate": "2021-03-19",
      "transactionDate": "2021-03-17",
      "transactionCode": "S",
      "transactionPrice": 655.81
    },
    {
      "name": "Baglino Andrew D",
      "share": 20614,
      "change": 1000,
      "filingDate": "2021-03-31",
      "transactionDate": "2021-03-29",
      "transactionCode": "M",
      "transactionPrice": 41.57
    },
    {
      "name": "Baglino Andrew D",
      "share": 19114,
      "change": -1500,
      "filingDate": "2021-03-31",
      "transactionDate": "2021-03-29",
      "transactionCode": "S",
      "transactionPrice": 615.75
    }
  ],
  "symbol": "TSLA"
}

Insider Sentiment
Get insider sentiment data for US companies calculated using method discussed here. The MSPR ranges from -100 for the most negative to 100 for the most positive which can signal price changes in the coming 30-90 days.

Method: GET

Examples:

/stock/insider-sentiment?symbol=TSLA&from=2015-01-01&to=2022-03-01

Arguments:

symbolREQUIRED
Symbol of the company: AAPL.

fromREQUIRED
From date: 2020-03-15.

toREQUIRED
To date: 2020-03-16.

Response Attributes:

data
Array of sentiment data.

change
Net buying/selling from all insiders' transactions.

month
Month.

mspr
Monthly share purchase ratio.

symbol
Symbol.

year
Year.

symbol
Symbol of the company.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.stock_insider_sentiment('AAPL', '2021-01-01', '2022-03-01'))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
{
  "data":[
    {
      "symbol":"TSLA",
      "year":2021,
      "month":3,
      "change":5540,
      "mspr":12.209097
    },
    {
      "symbol":"TSLA",
      "year":2022,
      "month":1,
      "change":-1250,
      "mspr":-5.6179776
    },
    {
      "symbol":"TSLA",
      "year":2022,
      "month":2,
      "change":-1250,
      "mspr":-2.1459227
    },
    {
      "symbol":"TSLA",
      "year":2022,
      "month":3,
      "change":5870,
      "mspr":8.960191
    }
  ],
  "symbol":"TSLA"
}

Financial Statements Premium
Get standardized balance sheet, income statement and cash flow for global companies going back 30+ years. Data is sourced from original filings most of which made available through SEC Filings and International Filings endpoints.

Wondering why our standardized data is different from Bloomberg, Reuters, Factset, S&P or Yahoo Finance ? Check out our FAQ page to learn more


Method: GET

Premium: Premium Access Required

Examples:

/stock/financials?symbol=AAPL&statement=bs&freq=annual

/stock/financials?symbol=AC.TO&statement=ic&freq=quarterly

Arguments:

symbolREQUIRED
Symbol of the company: AAPL.

statementREQUIRED
Statement can take 1 of these values bs, ic, cf for Balance Sheet, Income Statement, Cash Flow respectively.

freqREQUIRED
Frequency can take 1 of these values annual, quarterly, ttm, ytd. TTM (Trailing Twelve Months) option is available for Income Statement and Cash Flow. YTD (Year To Date) option is only available for Cash Flow.

Response Attributes:

financials
An array of map of key, value pairs containing the data for each period.

symbol
Symbol of the company.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.financials('AAPL', 'bs', 'annual'))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
{
  "financials": [
    {
      "costOfGoodsSold": 161782,
      "ebit": 63930,
      "grossIncome": 98392,
      "interestExpense": 3576,
      "netIncome": 55256,
      "netIncomeAfterTaxes": 55256,
      "period": "2019-09-28",
      "pretaxIncome": 65737,
      "provisionforIncomeTaxes": 10481,
      "researchDevelopment": 16217,
      "revenue": 260174,
      "sgaExpense": 18245,
      "totalOperatingExpense": 34462,
      "year": 2019
    }
  ],
  "symbol": "AAPL"
}    

Financials As Reported
Get financials as reported. This data is available for bulk download on Kaggle SEC Financials database.

Method: GET

Examples:

/stock/financials-reported?symbol=AAPL

/stock/financials-reported?cik=320193&freq=quarterly

/stock/financials-reported?accessNumber=0000320193-20-000052

Arguments:

symboloptional
Symbol.

cikoptional
CIK.

accessNumberoptional
Access number of a specific report you want to retrieve financials from.

freqoptional
Frequency. Can be either annual or quarterly. Default to annual.

fromoptional
From date YYYY-MM-DD. Filter for endDate.

tooptional
To date YYYY-MM-DD. Filter for endDate.

Response Attributes:

cik
CIK

data
Array of filings.

acceptedDate
Accepted date %Y-%m-%d %H:%M:%S.

accessNumber
Access number.

cik
CIK.

endDate
Period end date %Y-%m-%d %H:%M:%S.

filedDate
Filed date %Y-%m-%d %H:%M:%S.

form
Form type.

quarter
Quarter.

report
Report data.

startDate
Period start date %Y-%m-%d %H:%M:%S.

symbol
Symbol.

year
Year.

symbol
Symbol

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.financials_reported(symbol='AAPL', freq='annual'))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
{
  "cik": "320193",
  "data": [
    {
      "accessNumber": "0000320193-19-000119",
      "symbol": "AAPL",
      "cik": "320193",
      "year": 2019,
      "quarter": 0,
      "form": "10-K",
      "startDate": "2018-09-30 00:00:00",
      "endDate": "2019-09-28 00:00:00",
      "filedDate": "2019-10-31 00:00:00",
      "acceptedDate": "2019-10-30 18:12:36",
      "report": {
        "bs": {
          "Assets": 338516000000,
          "Liabilities": 248028000000,
          "InventoryNet": 4106000000,
          ...
        },
        "cf": {
          "NetIncomeLoss": 55256000000,
          "InterestPaidNet": 3423000000,
          ...
        },
        "ic": {
          "GrossProfit": 98392000000,
          "NetIncomeLoss": 55256000000,
          "OperatingExpenses": 34462000000,
           ...
        }
      }
    }
  ],
  "symbol": "AAPL"
}

Revenue Breakdown Premium
Get revenue breakdown as-reporetd by product and geography. Users on personal plans can access data for US companies which disclose their revenue breakdown in the annual or quarterly reports.

Global standardized revenue breakdown/segments data is available for Enterprise users. Contact us to inquire about the access for Global standardized data.


Method: GET

Premium: Premium

Examples:

/stock/revenue-breakdown?symbol=AAPL

/stock/revenue-breakdown?cik=320193

Arguments:

symboloptional
Symbol.

cikoptional
CIK.

Response Attributes:

cik
CIK

data
Array of revenue breakdown over multiple periods.

accessNumber
Access number of the report from which the data is sourced.

breakdown
Revenue breakdown.

symbol
Symbol

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.stock_revenue_breakdown('AAPL'))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
{
  "cik": "320193",
  "data": [
    {
      "accessNumber": "0000320193-21-000010",
      "breakdown": {
        "unit": "usd",
        "value": 111439000000,
        "concept": "us-gaap:RevenueFromContractWithCustomerExcludingAssessedTax",
        "endDate": "2020-12-26",
        "startDate": "2020-09-27",
        "revenueBreakdown": [
          {
            "axis": "srt:ProductOrServiceAxis",
            "data": [
              {
                "unit": "usd",
                "label": "Products",
                "value": 95678000000,
                "member": "us-gaap:ProductMember",
                "percentage": 85.85683647556061
              },
              {
                "unit": "usd",
                "label": "Services",
                "value": 15761000000,
                "member": "us-gaap:ServiceMember",
                "percentage": 14.14316352443938
              },
              {
                "unit": "usd",
                "label": "Services",
                "value": 15761000000,
                "member": "us-gaap:ServiceMember",
                "percentage": 14.14316352443938
              },
              {
                "unit": "usd",
                "label": "iPhone",
                "value": 65597000000,
                "member": "aapl:IPhoneMember",
                "percentage": 58.86359353547681
              },
              {
                "unit": "usd",
                "label": "Mac",
                "value": 8675000000,
                "member": "aapl:MacMember",
                "percentage": 7.784527858290185
              },
              {
                "unit": "usd",
                "label": "iPad",
                "value": 8435000000,
                "member": "aapl:IPadMember",
                "percentage": 7.569163398810111
              },
              {
                "unit": "usd",
                "label": "Wearables, Home and Accessories",
                "value": 12971000000,
                "member": "aapl:WearablesHomeandAccessoriesMember",
                "percentage": 11.639551682983516
              }
            ],
            "label": "Product and Service [Axis]"
          },
        ]
      }
    }
  ],
  "symbol": "AAPL"
}

SEC Filings
List company's filing. Limit to 250 documents at a time. This data is available for bulk download on Kaggle SEC Filings database.

Method: GET

Examples:

/stock/filings?symbol=AAPL

/stock/filings?cik=320193

/stock/filings?accessNumber=0000320193-20-000052

Arguments:

symboloptional
Symbol. Leave symbol,cik and accessNumber empty to list latest filings.

cikoptional
CIK.

accessNumberoptional
Access number of a specific report you want to retrieve data from.

formoptional
Filter by form. You can use this value NT 10-K to find non-timely filings for a company.

fromoptional
From date: 2023-03-15.

tooptional
To date: 2023-03-16.

Response Attributes:

acceptedDate
Accepted date %Y-%m-%d %H:%M:%S.

accessNumber
Access number.

cik
CIK.

filedDate
Filed date %Y-%m-%d %H:%M:%S.

filingUrl
Filing's URL.

form
Form type.

reportUrl
Report's URL.

symbol
Symbol.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.filings(symbol='AAPL', _from="2020-01-01", to="2020-06-11"))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
[
  {
    "accessNumber": "0001193125-20-050884",
    "symbol": "AAPL",
    "cik": "320193",
    "form": "8-K",
    "filedDate": "2020-02-27 00:00:00",
    "acceptedDate": "2020-02-27 06:14:21",
    "reportUrl": "https://www.sec.gov/ix?doc=/Archives/edgar/data/320193/000119312520050884/d865740d8k.htm",
    "filingUrl": "https://www.sec.gov/Archives/edgar/data/320193/000119312520050884/0001193125-20-050884-index.html"
  },
  {
    "accessNumber": "0001193125-20-039203",
    "symbol": "AAPL",
    "cik": "320193",
    "form": "8-K",
    "filedDate": "2020-02-18 00:00:00",
    "acceptedDate": "2020-02-18 06:24:57",
    "reportUrl": "https://www.sec.gov/ix?doc=/Archives/edgar/data/320193/000119312520039203/d845033d8k.htm",
    "filingUrl": "https://www.sec.gov/Archives/edgar/data/320193/000119312520039203/0001193125-20-039203-index.html"
  },
  ...
]

SEC Sentiment Analysis Premium
Get sentiment analysis of 10-K and 10-Q filings from SEC. An abnormal increase in the number of positive/negative words in filings can signal a significant change in the company's stock price in the upcoming 4 quarters. We make use of Loughran and McDonald Sentiment Word Lists to calculate the sentiment for each filing.

Method: GET

Premium: Premium Access Required

Examples:

/stock/filings-sentiment?accessNumber=0000320193-20-000052

Arguments:

accessNumberREQUIRED
Access number of a specific report you want to retrieve data from.

Response Attributes:

accessNumber
Access number.

cik
CIK.

sentiment
Filing Sentiment

constraining
% of constraining words in the filing.

litigious
% of litigious words in the filing.

modal-moderate
% of modal-moderate words in the filing.

modal-strong
% of modal-strong words in the filing.

modal-weak
% of modal-weak words in the filing.

negative
% of negative words in the filing.

polarity
% of polarity words in the filing.

positive
% of positive words in the filing.

uncertainty
% of uncertainty words in the filing.

symbol
Symbol.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.sec_sentiment_analysis('0000320193-20-000052'))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
{
  "cik": "320193",
  "symbol": "AAPL",
  "accessNumber": "0000320193-20-000052",
  "sentiment": {
    "negative": 1.2698412698412698,
    "polarity": -0.1147540479911535,
    "positive": 0.5042016806722689,
    "litigious": 0.2427637721755369,
    "modal-weak": 0.392156862745098,
    "uncertainty": 1.1391223155929038,
    "constraining": 0.5975723622782446,
    "modal-strong": 0.14939309056956115,
    "modal-moderate": 0.11204481792717086
  }
}

Similarity Index Premium
Calculate the textual difference between a company's 10-K / 10-Q reports and the same type of report in the previous year using Cosine Similarity. For example, this endpoint compares 2019's 10-K with 2018's 10-K. Companies breaking from its routines in disclosure of financial condition and risk analysis section can signal a significant change in the company's stock price in the upcoming 4 quarters.


Method: GET

Premium: Premium Access Required

Examples:

/stock/similarity-index?symbol=AAPL&freq=annual

/stock/similarity-index?cik=320193&freq=quarterly

Arguments:

symboloptional
Symbol. Required if cik is empty

cikoptional
CIK. Required if symbol is empty

freqoptional
annual or quarterly. Default to annual

Response Attributes:

cik
CIK.

similarity
Array of filings with its cosine similarity compared to the same report of the previous year.

acceptedDate
Accepted date %Y-%m-%d %H:%M:%S.

accessNumber
Access number.

cik
CIK.

filedDate
Filed date %Y-%m-%d %H:%M:%S.

filingUrl
Filing's URL.

form
Form type.

item1
Cosine similarity of Item 1 (Business). This number is only available for Annual reports.

item1a
Cosine similarity of Item 1A (Risk Factors). This number is available for both Annual and Quarterly reports.

item2
Cosine similarity of Item 2 (Management’s Discussion and Analysis of Financial Condition and Results of Operations). This number is only available for Quarterly reports.

item7
Cosine similarity of Item 7 (Management’s Discussion and Analysis of Financial Condition and Results of Operations). This number is only available for Annual reports.

item7a
Cosine similarity of Item 7A (Quantitative and Qualitative Disclosures About Market Risk). This number is only available for Annual reports.

reportUrl
Report's URL.

symbol
Symbol.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.sec_similarity_index('AAPL'))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
{
  "cik": "320193",
  "similarity": [
    {
      "cik": "320193",
      "accessNumber": "0000320193-19-000119",
      "item1": 0.8833750347608914,
      "item2": 0,
      "item1a": 0.994836154829746,
      "item7": 0.897030072745,
      "item7a": 0.9843052590436008,
      "form": "10-K",
      "reportUrl": "https://www.sec.gov/ix?doc=/Archives/edgar/data/320193/000032019319000119/a10-k20199282019.htm",
      "filingUrl": "https://www.sec.gov/Archives/edgar/data/320193/000032019319000119/0000320193-19-000119-index.html",
      "filedDate": "2019-10-31 00:00:00",
      "acceptedDate": "2019-10-30 18:12:36"
    },
    {
      "cik": "320193",
      "accessNumber": "0000320193-18-000145",
      "item1": 0.9737784696339462,
      "item2": 0,
      "item1a": 0.9931651573630014,
      "item7": 0.9441063774798184,
      "item7a": 0.9856181212005336,
      "form": "10-K",
      "reportUrl": "https://www.sec.gov/Archives/edgar/data/320193/000032019318000145/a10-k20189292018.htm",
      "filingUrl": "https://www.sec.gov/Archives/edgar/data/320193/000032019318000145/0000320193-18-000145-index.html",
      "filedDate": "2018-11-05 00:00:00",
      "acceptedDate": "2018-11-05 08:01:40"
    }
  ],
  "symbol": "AAPL"
}

IPO Calendar
Get recent and upcoming IPO.

Method: GET

Examples:

/calendar/ipo?from=2020-01-01&to=2020-04-30

Arguments:

fromREQUIRED
From date: 2020-03-15.

toREQUIRED
To date: 2020-03-16.

Response Attributes:

ipoCalendar
Array of IPO events.

date
IPO date.

exchange
Exchange.

name
Company's name.

numberOfShares
Number of shares offered during the IPO.

price
Projected price or price range.

status
IPO status. Can take 1 of the following values: expected,priced,withdrawn,filed

symbol
Symbol.

totalSharesValue
Total shares value.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.ipo_calendar(_from="2020-05-01", to="2020-06-01"))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
{
  "ipoCalendar": [
    {
      "date": "2020-04-03",
      "exchange": "NASDAQ Global",
      "name": "ZENTALIS PHARMACEUTICALS, LLC",
      "numberOfShares": 7650000,
      "price": "16.00-18.00",
      "status": "expected",
      "symbol": "ZNTL",
      "totalSharesValue": 158355000
    },
    {
      "date": "2020-04-01",
      "exchange": "NASDAQ Global",
      "name": "WIMI HOLOGRAM CLOUD INC.",
      "numberOfShares": 5000000,
      "price": "5.50-7.50",
      "status": "expected",
      "symbol": "WIMI",
      "totalSharesValue": 43125000
    },
  ]
}

Dividends Premium
Get dividends data for common stocks going back 30 years.

Method: GET

Premium: Premium Access Required

Examples:

/stock/dividend?symbol=AAPL&from=2022-02-01&to=2023-02-01

Arguments:

symbolREQUIRED
Symbol.

fromREQUIRED
YYYY-MM-DD.

toREQUIRED
YYYY-MM-DD.

Response Attributes:

adjustedAmount
Adjusted dividend.

amount
Amount in local currency.

currency
Currency.

date
Ex-Dividend date.

declarationDate
Declaration date.

freq
Dividend frequency. Can be 1 of the following values:

0: Annually
1: Monthly
2: Quarterly
3: Semi-annually
4: Other/Unknown
5: Bimonthly
6: Trimesterly
7: Weekly

payDate
Pay date.

recordDate
Record date.

symbol
Symbol.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.stock_dividends('KO', _from='2019-01-01', to='2020-01-01'))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
[
  {
    "symbol": "AAPL",
    "date": "2019-11-07",
    "amount": 0.77,
    "adjustedAmount": 0.77,
    "payDate": "2019-11-14",
    "recordDate": "2019-11-11",
    "declarationDate": "2019-10-30",
    "currency": "USD"
  },
  {
    "symbol": "AAPL",
    "date": "2019-08-09",
    "amount": 0.77,
    "adjustedAmount": 0.77,
    "payDate": "2019-08-15",
    "recordDate": "2019-08-12",
    "declarationDate": "2019-07-30",
    "currency": "USD"
  },
  {
    "symbol": "AAPL",
    "date": "2019-05-10",
    "amount": 0.77,
    "adjustedAmount": 0.77,
    "payDate": "2019-05-16",
    "recordDate": "2019-05-13",
    "declarationDate": "2019-05-01",
    "currency": "USD"
  },
  {
    "symbol": "AAPL",
    "date": "2019-02-08",
    "amount": 0.73,
    "adjustedAmount": 0.77,
    "payDate": "2019-02-14",
    "recordDate": "2019-02-11",
    "declarationDate": "2019-01-29",
    "currency": "USD"
  }
]

Sector Metrics Premium
Get ratios for different sectors and regions/indices.

Method: GET

Premium: Premium Access Required

Examples:

/sector/metrics?region=NA

Arguments:

regionREQUIRED
Region. A list of supported values for this field can be found here.

Response Attributes:

data
Metrics for each sector.

metrics
Metrics data in key-value format. a and m fields are for average and median respectively.

sector
Sector

region
Region.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.sector_metric('NA'))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
{
  "data": [
    {
      "metrics": {
        "assetTurnoverAnnual": {
          "a": 0.7245,
          "m": 0.5426
        },
        "assetTurnoverTTM": {
          "a": 0.7254,
          "m": 0.5463
        },
      },
      "sector": "Communication Services"
    },
    {
      "metrics": {
        "currentDividendYieldTTM": {
          "a": 30.9763,
          "m": 2.09
        },
        "currentEv/freeCashFlowAnnual": {
          "a": 286.4793,
          "m": 19.8488
        },
      },
      "sector": "Consumer Discretionary"
    }
  ],
  "region": "Asia_Ocenia"
}

Price Metrics Premium
Get company price performance statistics such as 52-week high/low, YTD return and much more.

Method: GET

Premium: Premium Access Required

Examples:

/stock/price-metric?symbol=AAPL

Arguments:

symbolREQUIRED
Symbol of the company: AAPL.

dateoptional
Get data on a specific date in the past. The data is available weekly so your date will be automatically adjusted to the last day of that week.

Response Attributes:

atDate
Data date.

data
Map key-value pair of key ratios and metrics.

symbol
Symbol of the company.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.price_metrics('AAPL'))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
{
  "data": {
    "100DayEMA": 295.7694,
    "100DaySMA": 319.2297,
    "10DayAverageTradingVolume": 53717320,
    "10DayEMA": 247.4641,
    "10DaySMA": 247.372,
    "14DayRSI": 34.0517,
    "1MonthHigh": 314.67,
    "1MonthHighDate": "2022-08-16",
    "50DayEMA": 277.482,
    "50DaySMA": 288.313,
    "52WeekHigh": 414.5,
    "52WeekHighDate": "2021-11-04",
    "52WeekLow": 206.86,
    "52WeekLowDate": "2022-05-24",
    "5DayEMA": 245.8814,
    "ytdPriceReturn": 10.1819
  },
  "symbol": "TSLA"
}

Symbol Change Premium
Get a list of symbol changes for US-listed, EU-listed, NSE and ASX securities. Limit to 2000 events at a time.

Method: GET

Premium: Premium Access Required

Examples:

/ca/symbol-change?from=2022-09-01&to=2022-10-30

Arguments:

fromREQUIRED
From date YYYY-MM-DD.

toREQUIRED
To date YYYY-MM-DD.

Response Attributes:

data
Array of symbol change events.

atDate
Event's date.

newSymbol
New symbol.

oldSymbol
Old symbol.

fromDate
From date.

toDate
To date.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.symbol_change(_from="2022-10-01", to="2022-10-11"))



Sample response
1
2
3
4
5
6
7
8
9
10
11
{
  "data": [
    {
      "atDate": "2022-10-05",
      "newSymbol": "MEN.L",
      "oldSymbol": "PPC.L"
    }
  ],
  "fromDate": "2022-10-01",
  "toDate": "2022-10-30"
}

ISIN Change Premium
Get a list of ISIN changes for EU-listed securities. Limit to 2000 events at a time.

Method: GET

Premium: Premium Access Required

Examples:

/ca/isin-change?from=2022-09-01&to=2022-10-30

Arguments:

fromREQUIRED
From date YYYY-MM-DD.

toREQUIRED
To date YYYY-MM-DD.

Response Attributes:

data
Array of ISIN change events.

atDate
Event's date.

newIsin
New ISIN.

oldIsin
Old ISIN.

fromDate
From date.

toDate
To date.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.isin_change(_from="2022-10-01", to="2022-10-11"))



Sample response
1
2
3
4
5
6
7
8
9
10
11
{
  "data": [
    {
      "atDate": "2021-08-30",
      "newIsin": "DE000A3E5CP0",
      "oldIsin": "DE0007239402"
    }
  ],
  "fromDate": "2021-08-07",
  "toDate": "2021-10-07"
}

Historical Market Cap Premium
Get historical market cap data for global companies.

Method: GET

Premium: Accessible with Fundamental 2 or All in One subscription.

Examples:

/stock/historical-market-cap?symbol=AAPL&from=2022-01-01&to=2024-05-06

Arguments:

symbolREQUIRED
Company symbol.

fromREQUIRED
From date YYYY-MM-DD.

toREQUIRED
To date YYYY-MM-DD.

Response Attributes:

currency
Currency

data
Array of market data.

atDate
Date of the reading

marketCapitalization
Value

symbol
Symbol

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.historical_market_cap('AAPL', _from="2020-06-01", to="2020-06-10"))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
{
  "currency": "USD",
  "data": [
    {
      "atDate": "2024-06-10",
      "marketCapitalization": 3759.182
    },
    {
      "atDate": "2024-06-09",
      "marketCapitalization": 21508.447
    }
  ],
  "symbol": "SYM"
}

Historical Employee Count Premium
Get historical employee count for global companies.

Method: GET

Premium: Accessible with Fundamental 2 or All in One subscription.

Examples:

/stock/historical-employee-count?symbol=AAPL&from=2022-01-01&to=2024-05-06

Arguments:

symbolREQUIRED
Company symbol.

fromREQUIRED
From date YYYY-MM-DD.

toREQUIRED
To date YYYY-MM-DD.

Response Attributes:

data
Array of market data.

atDate
Date of the reading

employee
Value

symbol
Symbol

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.historical_employee_count('AAPL', _from="2020-06-01", to="2020-06-10"))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
{
  "data": [
    {
      "atDate": "2023-09-30",
      "employee": 161000
    },
    {
      "atDate": "2022-09-24",
      "employee": 164000
    },
    {
      "atDate": "2021-09-25",
      "employee": 154000
    },
    {
      "atDate": "2020-09-26",
      "employee": 147000
    }
  ],
  "symbol": "AAPL"
}

Recommendation Trends
Get latest analyst recommendation trends for a company.

Method: GET

Examples:

/stock/recommendation?symbol=AAPL

/stock/recommendation?symbol=TSLA

Arguments:

symbolREQUIRED
Symbol of the company: AAPL.

Response Attributes:

buy
Number of recommendations that fall into the Buy category

hold
Number of recommendations that fall into the Hold category

period
Updated period

sell
Number of recommendations that fall into the Sell category

strongBuy
Number of recommendations that fall into the Strong Buy category

strongSell
Number of recommendations that fall into the Strong Sell category

symbol
Company symbol.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.recommendation_trends('AAPL'))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
[
  {
    "buy": 24,
    "hold": 7,
    "period": "2025-03-01",
    "sell": 0,
    "strongBuy": 13,
    "strongSell": 0,
    "symbol": "AAPL"
  },
  {
    "buy": 17,
    "hold": 13,
    "period": "2025-02-01",
    "sell": 5,
    "strongBuy": 13,
    "strongSell": 0,
    "symbol": "AAPL"
  }
]

Widget:

Price Target Premium
Get latest price target consensus.

Method: GET

Premium: Premium required.

Examples:

/stock/price-target?symbol=NFLX

/stock/price-target?symbol=DIS

Arguments:

symbolREQUIRED
Symbol of the company: AAPL.

Response Attributes:

lastUpdated
Updated time of the data

numberAnalysts
Number of Analysts.

symbol
Company symbol.

targetHigh
Highes analysts' target.

targetLow
Lowest analysts' target.

targetMean
Mean of all analysts' targets.

targetMedian
Median of all analysts' targets.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.price_target('AAPL'))



Sample response
1
2
3
4
5
6
7
8
9
{
  "lastUpdated": "2023-04-06 00:00:00",
  "numberAnalysts": 39,
  "symbol": "NFLX",
  "targetHigh": 462,
  "targetLow": 217.15,
  "targetMean": 364.37,
  "targetMedian": 359.04
}

Widget:

Stock Upgrade/Downgrade Premium
Get latest stock upgrade and downgrade.

Method: GET

Premium: Premium Access Required

Examples:

/stock/upgrade-downgrade?symbol=AAPL

/stock/upgrade-downgrade?symbol=BYND

Arguments:

symboloptional
Symbol of the company: AAPL. If left blank, the API will return latest stock upgrades/downgrades.

fromoptional
From date: 2000-03-15.

tooptional
To date: 2020-03-16.

Response Attributes:

action
Action can take any of the following values: up(upgrade), down(downgrade), main(maintains), init(initiate), reit(reiterate).

company
Company/analyst who did the upgrade/downgrade.

fromGrade
From grade.

gradeTime
Upgrade/downgrade time in UNIX timestamp.

symbol
Company symbol.

toGrade
To grade.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.upgrade_downgrade(symbol='AAPL', _from='2020-01-01', to='2020-06-30'))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
[
  {
    "symbol": "BYND",
    "gradeTime": 1567728000,
    "company": "DA Davidson",
    "fromGrade": "",
    "toGrade": "Underperform",
    "action": "init"
  },
  {
    "symbol": "BYND",
    "gradeTime": 1566259200,
    "company": "JP Morgan",
    "fromGrade": "Neutral",
    "toGrade": "Overweight",
    "action": "up"
  },
  {
    "symbol": "BYND",
    "gradeTime": 1564704000,
    "company": "Bank of America",
    "fromGrade": "",
    "toGrade": "Neutral",
    "action": "reit"
  }
]

Revenue Estimates Premium
Get company's revenue estimates.

Method: GET

Premium: Premium Access Required

Examples:

/stock/revenue-estimate?symbol=AAPL

/stock/revenue-estimate?symbol=TSLA&freq=annual

Arguments:

symbolREQUIRED
Symbol of the company: AAPL.

freqoptional
Can take 1 of the following values: annual, quarterly. Default to quarterly

Response Attributes:

data
List of estimates

numberAnalysts
Number of Analysts.

period
Period.

quarter
Fiscal quarter.

revenueAvg
Average revenue estimates including Finnhub's proprietary estimates.

revenueHigh
Highest estimate.

revenueLow
Lowest estimate.

year
Fiscal year.

freq
Frequency: annual or quarterly.

symbol
Company symbol.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.company_revenue_estimates('TSLA', freq='quarterly'))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
{
  "data": [
    {
      "numberAnalysts": 31,
      "period": "2020-06-30",
      "revenueAvg": 58800500000,
      "revenueHigh": 64060000000,
      "revenueLow": 54072000000,
      "quarter": 3,
      "year": 2020
    },
    {
      "numberAnalysts": 31,
      "period": "2020-03-31",
      "revenueAvg": 61287300000,
      "revenueHigh": 66557000000,
      "revenueLow": 54871000000,
      "quarter": 2,
      "year": 2020
    }
  ],
  "freq": "quarterly",
  "symbol": "AAPL"
}

Earnings Estimates Premium
Get company's EPS estimates.

Method: GET

Premium: Premium Access Required

Examples:

/stock/eps-estimate?symbol=AAPL

/stock/eps-estimate?symbol=AMZN&freq=annual

Arguments:

symbolREQUIRED
Symbol of the company: AAPL.

freqoptional
Can take 1 of the following values: annual, quarterly. Default to quarterly

Response Attributes:

data
List of estimates

epsAvg
Average EPS estimates including Finnhub's proprietary estimates.

epsHigh
Highest estimate.

epsLow
Lowest estimate.

numberAnalysts
Number of Analysts.

period
Period.

quarter
Fiscal quarter.

year
Fiscal year.

freq
Frequency: annual or quarterly.

symbol
Company symbol.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.company_eps_estimates('AAPL', freq='quarterly'))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
{
  "data": [
    {
      "epsAvg": 2.65,
      "epsHigh": 2.98,
      "epsLow": 2.05,
      "numberAnalysts": 35,
      "period": "2020-06-30",
      "quarter": 3,
      "year": 2020
    },
    {
      "epsAvg": 2.52,
      "epsHigh": 3.02,
      "epsLow": 2.21,
      "numberAnalysts": 34,
      "period": "2020-03-31",
      "quarter": 2,
      "year": 2020
    }
  ],
  "freq": "quarterly",
  "symbol": "AAPL"
}

Widget:

EBITDA Estimates Premium
Get company's ebitda estimates.

Method: GET

Premium: Premium Access Required

Examples:

/stock/ebitda-estimate?symbol=AAPL

/stock/ebitda-estimate?symbol=TSLA&freq=annual

Arguments:

symbolREQUIRED
Symbol of the company: AAPL.

freqoptional
Can take 1 of the following values: annual, quarterly. Default to quarterly

Response Attributes:

data
List of estimates

ebitdaAvg
Average EBITDA estimates including Finnhub's proprietary estimates.

ebitdaHigh
Highest estimate.

ebitdaLow
Lowest estimate.

numberAnalysts
Number of Analysts.

period
Period.

quarter
Fiscal quarter.

year
Fiscal year.

freq
Frequency: annual or quarterly.

symbol
Company symbol.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.company_ebitda_estimates('TSLA', freq='quarterly'))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
{
  "data": [
    {
      "numberAnalysts": 31,
      "period": "2020-06-30",
      "ebitdaAvg": 58800500000,
      "ebitdaHigh": 64060000000,
      "ebitdaLow": 54072000000,
      "quarter": 3,
      "year": 2020
    },
    {
      "numberAnalysts": 31,
      "period": "2020-03-31",
      "ebitdaAvg": 61287300000,
      "ebitdaHigh": 66557000000,
      "ebitdaLow": 54871000000,
      "quarter": 2,
      "year": 2020
    }
  ],
  "freq": "quarterly",
  "symbol": "AAPL"
}

EBIT Estimates Premium
Get company's ebit estimates.

Method: GET

Premium: Premium Access Required

Examples:

/stock/ebit-estimate?symbol=AAPL

/stock/ebit-estimate?symbol=TSLA&freq=annual

Arguments:

symbolREQUIRED
Symbol of the company: AAPL.

freqoptional
Can take 1 of the following values: annual, quarterly. Default to quarterly

Response Attributes:

data
List of estimates

ebitAvg
Average EBIT estimates including Finnhub's proprietary estimates.

ebitHigh
Highest estimate.

ebitLow
Lowest estimate.

numberAnalysts
Number of Analysts.

period
Period.

quarter
Fiscal quarter.

year
Fiscal year.

freq
Frequency: annual or quarterly.

symbol
Company symbol.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.company_ebit_estimates('TSLA', freq='quarterly'))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
{
  "data": [
    {
      "numberAnalysts": 31,
      "period": "2020-06-30",
      "ebitAvg": 58800500000,
      "ebitHigh": 64060000000,
      "ebitLow": 54072000000
      "quarter": 3,
      "year": 2020,
    },
    {
      "numberAnalysts": 31,
      "period": "2020-03-31",
      "ebitAvg": 61287300000,
      "ebitHigh": 66557000000,
      "ebitLow": 54871000000,
      "quarter": 2,
      "year": 2020,
    }
  ],
  "freq": "quarterly",
  "symbol": "AAPL"
}

Earnings Surprises
Get company historical quarterly earnings surprise going back to 2000.

Method: GET

Free Tier: Last 4 quarters

Examples:

/stock/earnings?symbol=AAPL

/stock/earnings?symbol=TSLA

Arguments:

symbolREQUIRED
Symbol of the company: AAPL.

limitoptional
Limit number of period returned. Leave blank to get the full history.

Response Attributes:

actual
Actual earning result.

estimate
Estimated earning.

period
Reported period.

quarter
Fiscal quarter.

surprise
Surprise - The difference between actual and estimate.

surprisePercent
Surprise percent.

symbol
Company symbol.

year
Fiscal year.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.company_earnings('TSLA', limit=5))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
[
  {
    "actual": 1.88,
    "estimate": 1.9744,
    "period": "2023-03-31",
    "quarter": 1,
    "surprise": -0.0944,
    "surprisePercent": -4.7812,
    "symbol": "AAPL",
    "year": 2023
  },
  {
    "actual": 1.29,
    "estimate": 1.2957,
    "period": "2022-12-31",
    "quarter": 4,
    "surprise": -0.0057,
    "surprisePercent": -0.4399,
    "symbol": "AAPL",
    "year": 2022
  },
  {
    "actual": 1.2,
    "estimate": 1.1855,
    "period": "2022-09-30",
    "quarter": 3,
    "surprise": 0.0145,
    "surprisePercent": 1.2231,
    "symbol": "AAPL",
    "year": 2022
  }
]

Widget:

Earnings Calendar
Get historical and coming earnings release. EPS and Revenue in this endpoint are non-GAAP, which means they are adjusted to exclude some one-time or unusual items. This is the same data investors usually react to and talked about on the media. Estimates are sourced from both sell-side and buy-side analysts.

Method: GET

Free Tier: 1 month of historical earnings and new updates

Examples:

/calendar/earnings?from=2025-02-01&to=2025-03-10

/calendar/earnings?from=2024-03-01&to=2025-03-09&symbol=AAPL

Arguments:

fromoptional
From date: 2020-03-15.

tooptional
To date: 2020-03-16.

symboloptional
Filter by symbol: AAPL.

internationaloptional
Set to true to include international markets. Default value is false

Response Attributes:

earningsCalendar
Array of earnings release.

date
Date.

epsActual
EPS actual.

epsEstimate
EPS estimate.

hour
Indicates whether the earnings is announced before market open(bmo), after market close(amc), or during market hour(dmh).

quarter
Earnings quarter.

revenueActual
Revenue actual.

revenueEstimate
Revenue estimate including Finnhub's proprietary estimates.

symbol
Symbol.

year
Earnings year.

Sample code

Python
1
2
3
4
5
import finnhub
finnhub_client = finnhub.Client(api_key="")

print(finnhub_client.earnings_calendar(_from="2021-06-10", to="2021-06-30", symbol="", international=False))



Sample response
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
{
  "earningsCalendar": [
    {
      "date": "2020-01-28",
      "epsActual": 4.99,
      "epsEstimate": 4.5474,
      "hour": "amc",
      "quarter": 1,
      "revenueActual": 91819000000,
      "revenueEstimate": 88496400810,
      "symbol": "AAPL",
      "year": 2020
    },
    {
      "date": "2019-10-30",
      "epsActual": 3.03,
      "epsEstimate": 2.8393,
      "hour": "amc",
      "quarter": 4,
      "revenueActual": 64040000000,
      "revenueEstimate": 62985161760,
      "symbol": "AAPL",
      "year": 2019
    }
   ]
}

Quote
Get real-time quote data for US stocks. Constant polling is not recommended. Use websocket if you need real-time updates.

Real-time stock prices for international markets are supported for Enterprise clients via our partner's feed. Contact Us to learn more.


Method: GET

Examples:

/quote?symbol=AAPL

/quote?symbol=MSFT

Arguments:

symbolREQUIRED
Symbol

Response Attributes:

c
Current price

d
Change

dp
Percent change

h
High price of the day

l
Low price of the day

o
Open price of the day

pc
Previous close price

