FMP is your source for the most reliable and accurate Stock Market API and Financial Data API available. Whether you're looking for real-time stock prices, financial statements, or historical data, we offer a comprehensive solution to meet all your financial data needs.

Our platform provides free stock market data, including audited, standardized, and real-time updates of income statements, balance sheets, and cash flow statements on a quarterly and annual basis.

We also offer a wide range of historical stock prices, from 1 minute, 15 minutes, 30 minutes, 1 hour and daily intervals, ensuring you have the data you need.

Please contact us with any questions about APIs or pricing.

To authorize your requests, add ?apikey=YOUR_API_KEY at the end of every request.

Note: When adding the API key to your requests, ensure to use &apikey= if other query parameters already exist in the endpoint.

Search
Stock Symbol Search API
Globe Flag
Easily find the ticker symbol of any stock with the FMP Stock Symbol Search API. Search by company name or symbol across multiple global markets.

Endpoint:

https://financialmodelingprep.com/stable/search-symbol?query=AAPL

Parameters

Query Parameter

Type

Example

query*

string

AAPL

limit

number

50

exchange

string

NASDAQ

(*) Required
Response
1
2
3
4
5
6
7
8
9
[
	{
		"symbol": "AAPL",
		"name": "Apple Inc.",
		"currency": "USD",
		"exchangeFullName": "NASDAQ Global Select",
		"exchange": "NASDAQ"
	}
]

Company Name Search API
Globe Flag
Search for ticker symbols, company names, and exchange details for equity securities and ETFs listed on various exchanges with the FMP Name Search API. This endpoint is useful for retrieving ticker symbols when you know the full or partial company or asset name but not the symbol identifier.

Endpoint:

https://financialmodelingprep.com/stable/search-name?query=AA

Parameters

Query Parameter

Type

Example

query*

string

AA

limit

number

50

exchange

string

NASDAQ

(*) Required
Response
1
2
3
4
5
6
7
8
9
[
	{
		"symbol": "AAGUSD",
		"name": "AAG USD",
		"currency": "USD",
		"exchangeFullName": "CCC",
		"exchange": "CRYPTO"
	}
]

CIK API
USA Flag
Easily retrieve the Central Index Key (CIK) for publicly traded companies with the FMP CIK API. Access unique identifiers needed for SEC filings and regulatory documents for a streamlined compliance and financial analysis process.

Endpoint:

https://financialmodelingprep.com/stable/search-cik?cik=320193

Parameters

Query Parameter

Type

Example

cik*

string

320193

limit

number

50

(*) Required
Response
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
[
	{
		"symbol": "AAPL",
		"companyName": "Apple Inc.",
		"cik": "0000320193",
		"exchangeFullName": "NASDAQ Global Select",
		"exchange": "NASDAQ",
		"currency": "USD"
	}
]

CUSIP API
Globe Flag
Easily search and retrieve financial securities information by CUSIP number using the FMP CUSIP API. Find key details such as company name, stock symbol, and market capitalization associated with the CUSIP.

Endpoint:

https://financialmodelingprep.com/stable/search-cusip?cusip=037833100

Parameters

Query Parameter

Type

Example

cusip*

string

037833100

(*) Required
Response
1
2
3
4
5
6
7
8
[
	{
		"symbol": "AAPL",
		"companyName": "Apple Inc.",
		"cusip": "037833100",
		"marketCap": 3542555295744
	}
]

ISIN API
Globe Flag
Easily search and retrieve the International Securities Identification Number (ISIN) for financial securities using the FMP ISIN API. Find key details such as company name, stock symbol, and market capitalization associated with the ISIN.

Endpoint:

https://financialmodelingprep.com/stable/search-isin?isin=US0378331005

Parameters

Query Parameter

Type

Example

isin*

string

US0378331005

(*) Required
Response
1
2
3
4
5
6
7
8
[
	{
		"symbol": "AAPL",
		"name": "Apple Inc.",
		"isin": "US0378331005",
		"marketCap": 3427916386000
	}
]

Stock Screener API
Globe Flag
Discover stocks that align with your investment strategy using the FMP Stock Screener API. Filter stocks based on market cap, price, volume, beta, sector, country, and more to identify the best opportunities.

Endpoint:

https://financialmodelingprep.com/stable/company-screener

Parameters

Query Parameter

Type

Example

marketCapMoreThan

number

1000000

marketCapLowerThan

number

1000000000

sector

string

Technology

industry

string

Consumer Electronics

betaMoreThan

number

0.5

betaLowerThan

number

1.5

priceMoreThan

number

10

priceLowerThan

number

200

dividendMoreThan

number

0.5

dividendLowerThan

number

2

volumeMoreThan

number

1000

volumeLowerThan

number

1000000

exchange

string

NASDAQ


country

string

US

isEtf

boolean

false

isFund

boolean

false

isActivelyTrading

boolean

true

limit

number

1000

includeAllShareClasses

boolean

false

(*) Required
Response
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
[
	{
		"symbol": "AAPL",
		"companyName": "Apple Inc.",
		"marketCap": 3435062313000,
		"sector": "Technology",
		"industry": "Consumer Electronics",
		"beta": 1.24,
		"price": 225.93,
		"lastAnnualDividend": 1,
		"volume": 43010091,
		"exchange": "NASDAQ Global Select",
		"exchangeShortName": "NASDAQ",
		"country": "US",
		"isEtf": false,
		"isFund": false,
		"isActivelyTrading": true
	}
]

Exchange Variants API
Globe Flag
Search across multiple public exchanges to find where a given stock symbol is listed using the FMP Exchange Variants API. This allows users to quickly identify all the exchanges where a security is actively traded.

Endpoint:

https://financialmodelingprep.com/stable/search-exchange-variants?symbol=AAPL

Parameters

Query Parameter

Type

Example

symbol*

string

AAPL

(*) Required
Response
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
[
	{
		"symbol": "AAPL",
		"price": 225.46,
		"beta": 1.24,
		"volAvg": 54722288,
		"mktCap": 3427916386000,
		"lastDiv": 1,
		"range": "164.08-237.23",
		"changes": -7.54,
		"companyName": "Apple Inc.",
		"currency": "USD",
		"cik": "0000320193",
		"isin": "US0378331005",
		"cusip": "037833100",
		"exchange": "NASDAQ Global Select",
		"exchangeShortName": "NASDAQ",
		"industry": "Consumer Electronics",
		"website": "https://www.apple.com",
		"description": "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, a line of smartphones; Mac, a line of personal computers; iPad, a line of multi-purpose tablets; and wearables, home, and accessories comprising AirPods, Apple TV, Apple Watch, Beats products, and HomePod. It also provides AppleCare support and cloud services; and operates various platforms, including the App Store that allow customers to discov...",
		"ceo": "Mr. Timothy D. Cook",
		"sector": "Technology",
		"country": "US",
		"fullTimeEmployees": "161000",
		"phone": "408 996 1010",
		"address": "One Apple Park Way",
		"city": "Cupertino",
		"state": "CA",
		"zip": "95014",
		"dcfDiff": 62.45842,
		"dcf": 161.68157666868984,
		"image": "https://financialmodelingprep.com/image-stock/AAPL.png",
		"ipoDate": "1980-12-12",
		"defaultImage": false,
		"isEtf": false,
		"isActivelyTrading": true,
		"isAdr": false,
		"isFund": false
	}
]

Directory
Company Symbols List API
Globe Flag
Easily retrieve a comprehensive list of financial symbols with the FMP Company Symbols List API. Access a broad range of stock symbols and other tradable financial instruments from various global exchanges, helping you explore the full range of available securities.

Endpoint:

https://financialmodelingprep.com/stable/stock-list

Financial Statement Symbols List API
Globe Flag
Access a comprehensive list of companies with available financial statements through the FMP Financial Statement Symbols List API. Find companies listed on major global exchanges and obtain up-to-date financial data including income statements, balance sheets, and cash flow statements, are provided.

Endpoint:

https://financialmodelingprep.com/stable/financial-statement-symbol-list

CIK List API
USA Flag
Access a comprehensive database of CIK (Central Index Key) numbers for SEC-registered entities with the FMP CIK List API. This endpoint is essential for businesses, financial professionals, and individuals who need quick access to CIK numbers for regulatory compliance, financial transactions, and investment research.

Endpoint:

https://financialmodelingprep.com/stable/cik-list?page=0&limit=1000

Parameters

Symbol Changes List API
USA Flag
Stay informed about the latest stock symbol changes with the FMP Stock Symbol Changes API. Track changes due to mergers, acquisitions, stock splits, and name changes to ensure accurate trading and analysis.

Endpoint:

https://financialmodelingprep.com/stable/symbol-change

Parameters

ETF Symbol Search API
Globe Flag
Quickly find ticker symbols and company names for Exchange Traded Funds (ETFs) using the FMP ETF Symbol Search API. This tool simplifies identifying specific ETFs by their name or ticker.

Endpoint:

https://financialmodelingprep.com/stable/etf-list

Actively Trading List API
Globe Flag
List all actively trading companies and financial instruments with the FMP Actively Trading List API. This endpoint allows users to filter and display securities that are currently being traded on public exchanges, ensuring you access real-time market activity.

Endpoint:

https://financialmodelingprep.com/stable/actively-trading-list

Earnings Transcript List API
USA Flag
Access available earnings transcripts for companies with the FMP Earnings Transcript List API. Retrieve a list of companies with earnings transcripts, along with the total number of transcripts available for each company.

Endpoint:

https://financialmodelingprep.com/stable/earnings-transcript-list

Available Exchanges API
Globe Flag
Access a complete list of supported stock exchanges using the FMP Available Exchanges API. This API provides a comprehensive overview of global stock exchanges, allowing users to identify where securities are traded and filter data by specific exchanges for further analysis.

Endpoint:

https://financialmodelingprep.com/stable/available-exchanges

Available Sectors API
Access a complete list of industry sectors using the FMP Available Sectors API. This API helps users categorize and filter companies based on their respective sectors, enabling deeper analysis and more focused queries across different industries.

Endpoint:

https://financialmodelingprep.com/stable/available-sectors

Available Industries API
Access a comprehensive list of industries where stock symbols are available using the FMP Available Industries API. This API helps users filter and categorize companies based on their industry for more focused research and analysis.

Endpoint:

https://financialmodelingprep.com/stable/available-industries

Available Countries API
Access a comprehensive list of countries where stock symbols are available with the FMP Available Countries API. This API enables users to filter and analyze stock symbols based on the country of origin or the primary market where the securities are traded.

Endpoint:

https://financialmodelingprep.com/stable/available-countries

Analyst
Financial Estimates API
Globe Flag
Retrieve analyst financial estimates for stock symbols with the FMP Financial Estimates API. Access projected figures like revenue, earnings per share (EPS), and other key financial metrics as forecasted by industry analysts to inform your investment decisions.

Endpoint:

https://financialmodelingprep.com/stable/analyst-estimates?symbol=AAPL&period=annual&page=0&limit=10

Parameters

Ratings Snapshot API
Globe Flag
Quickly assess the financial health and performance of companies with the FMP Ratings Snapshot API. This API provides a comprehensive snapshot of financial ratings for stock symbols in our database, based on various key financial ratios.

Endpoint:

https://financialmodelingprep.com/stable/ratings-snapshot?symbol=AAPL

Parameters

Historical Ratings API
Globe Flag
Track changes in financial performance over time with the FMP Historical Ratings API. This API provides access to historical financial ratings for stock symbols in our database, allowing users to view ratings and key financial metric scores for specific dates.

Endpoint:

https://financialmodelingprep.com/stable/ratings-historical?symbol=AAPL

Parameters

Price Target Summary API
USA Flag
Gain insights into analysts' expectations for stock prices with the FMP Price Target Summary API. This API provides access to average price targets from analysts across various timeframes, helping investors assess future stock performance based on expert opinions.

Endpoint:

https://financialmodelingprep.com/stable/price-target-summary?symbol=AAPL

Parameters

Price Target Consensus API
USA Flag
Access analysts' consensus price targets with the FMP Price Target Consensus API. This API provides high, low, median, and consensus price targets for stocks, offering investors a comprehensive view of market expectations for future stock prices.

Endpoint:

https://financialmodelingprep.com/stable/price-target-consensus?symbol=AAPL

Parameters

Price Target News API
USA Flag
Stay informed with real-time updates on analysts' price targets for stocks using the FMP Price Target News API. Access the latest forecasts, stock prices at the time of the update, and direct links to trusted news sources for deeper insights.

Endpoint:

https://financialmodelingprep.com/stable/price-target-news?symbol=AAPL&page=0&limit=10

Parameters

Price Target Latest News API
USA Flag
Stay updated with the most recent analyst price target updates for all stock symbols using the FMP Price Target Latest News API. Get access to detailed forecasts, stock prices at the time of the update, analyst insights, and direct links to news sources for deeper analysis.

Endpoint:

https://financialmodelingprep.com/stable/price-target-latest-news?page=0&limit=10

Parameters

Stock Grades API
Globe Flag
Access the latest stock grades from top analysts and financial institutions with the FMP Grades API. Track grading actions, such as upgrades, downgrades, or maintained ratings, for specific stock symbols, providing valuable insight into how experts evaluate companies over time.

Endpoint:

https://financialmodelingprep.com/stable/grades?symbol=AAPL

Parameters

Historical Stock Grades API
Globe Flag
Access a comprehensive record of analyst grades with the FMP Historical Grades API. This tool allows you to track historical changes in analyst ratings for specific stock symbol

Endpoint:

https://financialmodelingprep.com/stable/grades-historical?symbol=AAPL

Parameters

Stock Grades Summary API
Globe Flag
Quickly access an overall view of analyst ratings with the FMP Grades Summary API. This API provides a consolidated summary of market sentiment for individual stock symbols, including the total number of strong buy, buy, hold, sell, and strong sell ratings. Understand the overall consensus on a stock’s outlook with just a few data points.

Endpoint:

https://financialmodelingprep.com/stable/grades-consensus?symbol=AAPL

Parameters

Stock Grade News API
USA Flag
Stay informed on the latest analyst grade changes with the FMP Grade News API. This API provides real-time updates on stock rating changes, including the grading company, previous and new grades, and the action taken. Direct links to trusted news sources and stock prices at the time of the update help you stay ahead of market trends and analyst opinions for specific stock symbols.

Endpoint:

https://financialmodelingprep.com/stable/grades-news?symbol=AAPL&page=0&limit=1

Parameters

Stock Grade Latest News API
USA Flag
Stay informed on the latest stock rating changes with the FMP Grade Latest News API. This API provides the most recent updates on analyst ratings for all stock symbols, including links to the original news sources. Track stock price movements, grading firm actions, and market sentiment shifts in real time, sourced from trusted publishers.

Endpoint:

https://financialmodelingprep.com/stable/grades-latest-news?page=0&limit=10

Parameters

Calendar
Dividends Company API
Globe Flag
Stay informed about upcoming dividend payments with the FMP Dividends Company API. This API provides essential dividend data for individual stock symbols, including record dates, payment dates, declaration dates, and more.

Endpoint:

https://financialmodelingprep.com/stable/dividends?symbol=AAPL

Parameters

Dividends Calendar API
Globe Flag
Stay informed on upcoming dividend events with the Dividend Events Calendar API. Access a comprehensive schedule of dividend-related dates for all stocks, including record dates, payment dates, declaration dates, and dividend yields.

Endpoint:

https://financialmodelingprep.com/stable/dividends-calendar

Parameters

Earnings Report API
Globe Flag
Retrieve in-depth earnings information with the FMP Earnings Report API. Gain access to key financial data for a specific stock symbol, including earnings report dates, EPS estimates, and revenue projections to help you stay on top of company performance.

Endpoint:

https://financialmodelingprep.com/stable/earnings?symbol=AAPL

Parameters

Earnings Calendar API
Globe Flag
Stay informed on upcoming and past earnings announcements with the FMP Earnings Calendar API. Access key data, including announcement dates, estimated earnings per share (EPS), and actual EPS for publicly traded companies.

Endpoint:

https://financialmodelingprep.com/stable/earnings-calendar

Parameters

IPOs Calendar API
Globe Flag
Access a comprehensive list of all upcoming initial public offerings (IPOs) with the FMP IPO Calendar API. Stay up to date on the latest companies entering the public market, with essential details on IPO dates, company names, expected pricing, and exchange listings.

Endpoint:

https://financialmodelingprep.com/stable/ipos-calendar

Parameters

IPOs Disclosure API
USA Flag
Access a comprehensive list of disclosure filings for upcoming initial public offerings (IPOs) with the FMP IPO Disclosures API. Stay updated on regulatory filings, including filing dates, effectiveness dates, CIK numbers, and form types, with direct links to official SEC documents.

Endpoint:

https://financialmodelingprep.com/stable/ipos-disclosure

Parameters

IPOs Prospectus API
USA Flag
Access comprehensive information on IPO prospectuses with the FMP IPO Prospectus API. Get key financial details, such as public offering prices, discounts, commissions, proceeds before expenses, and more. This API also provides links to official SEC prospectuses, helping investors stay informed on companies entering the public market.

Endpoint:

https://financialmodelingprep.com/stable/ipos-prospectus

Parameters

Stock Split Details API
Globe Flag
Access detailed information on stock splits for a specific company using the FMP Stock Split Details API. This API provides essential data, including the split date and the split ratio, helping users understand changes in a company's share structure after a stock split.

Endpoint:

https://financialmodelingprep.com/stable/splits?symbol=AAPL

Parameters

Stock Splits Calendar API
Globe Flag
Stay informed about upcoming stock splits with the FMP Stock Splits Calendar API. This API provides essential data on upcoming stock splits across multiple companies, including the split date and ratio, helping you track changes in share structures before they occur.

Endpoint:

https://financialmodelingprep.com/stable/splits-calendar

Parameters

Chart
Stock Chart Light API
Globe Flag
Access simplified stock chart data using the FMP Basic Stock Chart API. This API provides essential charting information, including date, price, and trading volume, making it ideal for tracking stock performance with minimal data and creating basic price and volume charts.

Endpoint:

https://financialmodelingprep.com/stable/historical-price-eod/light?symbol=AAPL

Parameters

Stock Price and Volume Data API
Globe Flag
Access full price and volume data for any stock symbol using the FMP Comprehensive Stock Price and Volume Data API. Get detailed insights, including open, high, low, close prices, trading volume, price changes, percentage changes, and volume-weighted average price (VWAP).

Endpoint:

https://financialmodelingprep.com/stable/historical-price-eod/full?symbol=AAPL

Parameters

Unadjusted Stock Price API
Globe Flag
Access stock price and volume data without adjustments for stock splits with the FMP Unadjusted Stock Price Chart API. Get accurate insights into stock performance, including open, high, low, and close prices, along with trading volume, without split-related changes.

Endpoint:

https://financialmodelingprep.com/stable/historical-price-eod/non-split-adjusted?symbol=AAPL

Parameters

Dividend Adjusted Price Chart API
Globe Flag
Analyze stock performance with dividend adjustments using the FMP Dividend-Adjusted Price Chart API. Access end-of-day price and volume data that accounts for dividend payouts, offering a more comprehensive view of stock trends over time.

Endpoint:

https://financialmodelingprep.com/stable/historical-price-eod/dividend-adjusted?symbol=AAPL

Parameters

1 Min Interval Stock Chart API
Globe Flag
Access precise intraday stock price and volume data with the FMP 1-Minute Interval Stock Chart API. Retrieve real-time or historical stock data in 1-minute intervals, including key information such as open, high, low, and close prices, and trading volume for each minute.

Endpoint:

https://financialmodelingprep.com/stable/historical-chart/1min?symbol=AAPL

Parameters

5 Min Interval Stock Chart API
Globe Flag
Access stock price and volume data with the FMP 5-Minute Interval Stock Chart API. Retrieve detailed stock data in 5-minute intervals, including open, high, low, and close prices, along with trading volume for each 5-minute period. This API is perfect for short-term trading analysis and building intraday charts.

Endpoint:

https://financialmodelingprep.com/stable/historical-chart/5min?symbol=AAPL

Parameters

15 Min Interval Stock Chart API
Globe Flag
Access stock price and volume data with the FMP 15-Minute Interval Stock Chart API. Retrieve detailed stock data in 15-minute intervals, including open, high, low, close prices, and trading volume. This API is ideal for creating intraday charts and analyzing medium-term price trends during the trading day.

Endpoint:

https://financialmodelingprep.com/stable/historical-chart/15min?symbol=AAPL

Parameters

30 Min Interval Stock Chart API
Globe Flag
Access stock price and volume data with the FMP 30-Minute Interval Stock Chart API. Retrieve essential stock data in 30-minute intervals, including open, high, low, close prices, and trading volume. This API is perfect for creating intraday charts and tracking medium-term price movements for more strategic trading decisions.

Endpoint:

https://financialmodelingprep.com/stable/historical-chart/30min?symbol=AAPL

Parameters

1 Hour Interval Stock Chart API
Globe Flag
Track stock price movements over hourly intervals with the FMP 1-Hour Interval Stock Chart API. Access essential stock price and volume data, including open, high, low, and close prices for each hour, to analyze broader intraday trends with precision.

Endpoint:

https://financialmodelingprep.com/stable/historical-chart/1hour?symbol=AAPL

Parameters

4 Hour Interval Stock Chart API
Globe Flag
Analyze stock price movements over extended intraday periods with the FMP 4-Hour Interval Stock Chart API. Access key stock price and volume data in 4-hour intervals, perfect for tracking longer intraday trends and understanding broader market movements.

Endpoint:

https://financialmodelingprep.com/stable/historical-chart/4hour?symbol=AAPL

Parameters

Company
Company Profile Data API
Globe Flag
Access detailed company profile data with the FMP Company Profile Data API. This API provides key financial and operational information for a specific stock symbol, including the company's market capitalization, stock price, industry, and much more.

Endpoint:

https://financialmodelingprep.com/stable/profile?symbol=AAPL

Parameters

Company Profile by CIK API
USA Flag
Retrieve detailed company profile data by CIK (Central Index Key) with the FMP Company Profile by CIK API. This API allows users to search for companies using their unique CIK identifier and access a full range of company data, including stock price, market capitalization, industry, and much more.

Endpoint:

https://financialmodelingprep.com/stable/profile-cik?cik=320193

Parameters

Company Notes API
USA Flag
Retrieve detailed information about company-issued notes with the FMP Company Notes API. Access essential data such as CIK number, stock symbol, note title, and the exchange where the notes are listed.

Endpoint:

https://financialmodelingprep.com/stable/company-notes?symbol=AAPL

Parameters

Stock Peer Comparison API
Globe Flag
Identify and compare companies within the same sector and market capitalization range using the FMP Stock Peer Comparison API. Gain insights into how a company stacks up against its peers on the same exchange.

Endpoint:

https://financialmodelingprep.com/stable/stock-peers?symbol=AAPL

Parameters

Delisted Companies API
USA Flag
Stay informed with the FMP Delisted Companies API. Access a comprehensive list of companies that have been delisted from US exchanges to avoid trading in risky stocks and identify potential financial troubles.

Endpoint:

https://financialmodelingprep.com/stable/delisted-companies?page=0&limit=100

Parameters

Company Employee Count API
USA Flag
Retrieve detailed workforce information for companies, including employee count, reporting period, and filing date. The FMP Company Employee Count API also provides direct links to official SEC documents for further verification and in-depth research.

Endpoint:

https://financialmodelingprep.com/stable/employee-count?symbol=AAPL

Parameters

Company Historical Employee Count API
USA Flag
Access historical employee count data for a company based on specific reporting periods. The FMP Company Historical Employee Count API provides insights into how a company’s workforce has evolved over time, allowing users to analyze growth trends and operational changes.

Endpoint:

https://financialmodelingprep.com/stable/historical-employee-count?symbol=AAPL

Parameters

Company Market Cap API
Globe Flag
Retrieve the market capitalization for a specific company on any given date using the FMP Company Market Capitalization API. This API provides essential data to assess the size and value of a company in the stock market, helping users gauge its overall market standing.

Endpoint:

https://financialmodelingprep.com/stable/market-capitalization?symbol=AAPL

Parameters

Batch Market Cap API
Globe Flag
Retrieve market capitalization data for multiple companies in a single request with the FMP Batch Market Capitalization API. This API allows users to compare the market size of various companies simultaneously, streamlining the analysis of company valuations.

Endpoint:

https://financialmodelingprep.com/stable/market-capitalization-batch?symbols=AAPL,MSFT,GOOG

Parameters

Historical Market Cap API
Globe Flag
Access historical market capitalization data for a company using the FMP Historical Market Capitalization API. This API helps track the changes in market value over time, enabling long-term assessments of a company's growth or decline.

Endpoint:

https://financialmodelingprep.com/stable/historical-market-capitalization?symbol=AAPL

Parameters

Company Share Float & Liquidity API
Globe Flag
Understand the liquidity and volatility of a stock with the FMP Company Share Float and Liquidity API. Access the total number of publicly traded shares for any company to make informed investment decisions.

Endpoint:

https://financialmodelingprep.com/stable/shares-float?symbol=AAPL

Parameters

All Shares Float API
Globe Flag
Access comprehensive shares float data for all available companies with the FMP All Shares Float API. Retrieve critical information such as free float, float shares, and outstanding shares to analyze liquidity across a wide range of companies.

Endpoint:

https://financialmodelingprep.com/stable/shares-float-all?page=0&limit=1000

Parameters

Latest Mergers & Acquisitions API
USA Flag
Access real-time data on the latest mergers and acquisitions with the FMP Latest Mergers and Acquisitions API. This API provides key information such as the transaction date, company names, and links to detailed filing information for further analysis.

Endpoint:

https://financialmodelingprep.com/stable/mergers-acquisitions-latest?page=0&limit=100

Parameters

Search Mergers & Acquisitions API
USA Flag
Search for specific mergers and acquisitions data with the FMP Search Mergers and Acquisitions API. Retrieve detailed information on M&A activity, including acquiring and targeted companies, transaction dates, and links to official SEC filings.

Endpoint:

https://financialmodelingprep.com/stable/mergers-acquisitions-search?name=Apple

Parameters

Company Executives API
Globe Flag
Retrieve detailed information on company executives with the FMP Company Executives API. This API provides essential data about key executives, including their name, title, compensation, and other demographic details such as gender and year of birth.

Endpoint:

https://financialmodelingprep.com/stable/key-executives?symbol=AAPL

Parameters

Executive Compensation API
USA Flag
Retrieve comprehensive compensation data for company executives with the FMP Executive Compensation API. This API provides detailed information on salaries, stock awards, total compensation, and other relevant financial data, including filing details and links to official documents.

Endpoint:

https://financialmodelingprep.com/stable/governance-executive-compensation?symbol=AAPL

Parameters

Executive Compensation Benchmark API
USA Flag
Gain access to average executive compensation data across various industries with the FMP Executive Compensation Benchmark API. This API provides essential insights for comparing executive pay by industry, helping you understand compensation trends and benchmarks.

Endpoint:

https://financialmodelingprep.com/stable/executive-compensation-benchmark

Parameters

Commitment Of Traders
COT Report API
Access comprehensive Commitment of Traders (COT) reports with the FMP COT Report API. This API provides detailed information about long and short positions across various sectors, helping you assess market sentiment and track positions in commodities, indices, and financial instruments.

Endpoint:

https://financialmodelingprep.com/stable/commitment-of-traders-report

Parameters

COT Analysis By Dates API
Gain in-depth insights into market sentiment with the FMP COT Report Analysis API. Analyze the Commitment of Traders (COT) reports for a specific date range to evaluate market dynamics, sentiment, and potential reversals across various sectors.

Endpoint:

https://financialmodelingprep.com/stable/commitment-of-traders-analysis

Parameters

COT Report List API
Access a comprehensive list of available Commitment of Traders (COT) reports by commodity or futures contract using the FMP COT Report List API. This API provides an overview of different market segments, allowing users to retrieve and explore COT reports for a wide variety of commodities and financial instruments.

Endpoint:

https://financialmodelingprep.com/stable/commitment-of-traders-list

Discounted Cash Flow
DCF Valuation API
Globe Flag
Estimate the intrinsic value of a company with the FMP Discounted Cash Flow Valuation API. Calculate the DCF valuation based on expected future cash flows and discount rates.

Endpoint:

https://financialmodelingprep.com/stable/discounted-cash-flow?symbol=AAPL

Parameters

Levered DCF API
Globe Flag
Analyze a company’s value with the FMP Levered Discounted Cash Flow (DCF) API, which incorporates the impact of debt. This API provides post-debt company valuation, offering investors a more accurate measure of a company's true worth by accounting for its debt obligations.

Endpoint:

https://financialmodelingprep.com/stable/levered-discounted-cash-flow?symbol=AAPL

Parameters

Custom DCF Advanced API
Globe Flag
Run a tailored Discounted Cash Flow (DCF) analysis using the FMP Custom DCF Advanced API. With detailed inputs, this API allows users to fine-tune their assumptions and variables, offering a more personalized and precise valuation for a company.

Endpoint:

https://financialmodelingprep.com/stable/custom-discounted-cash-flow?symbol=AAPL

Parameters

Custom DCF Levered API
Globe Flag
Run a tailored Discounted Cash Flow (DCF) analysis using the FMP Custom DCF Advanced API. With detailed inputs, this API allows users to fine-tune their assumptions and variables, offering a more personalized and precise valuation for a company.

Endpoint:

https://financialmodelingprep.com/stable/custom-levered-discounted-cash-flow?symbol=AAPL

Parameters

Economics
Treasury Rates API
Access real-time and historical Treasury rates for all maturities with the FMP Treasury Rates API. Track key benchmarks for interest rates across the economy.

Endpoint:

https://financialmodelingprep.com/stable/treasury-rates

Parameters

Economics Indicators API
Access real-time and historical economic data for key indicators like GDP, unemployment, and inflation with the FMP Economic Indicators API. Use this data to measure economic performance and identify growth trends.

Endpoint:

https://financialmodelingprep.com/stable/economic-indicators?name=GDP

Parameters

Economic Data Releases Calendar API
Stay informed with the FMP Economic Data Releases Calendar API. Access a comprehensive calendar of upcoming economic data releases to prepare for market impacts and make informed investment decisions.

Endpoint:

https://financialmodelingprep.com/stable/economic-calendar

Parameters

Market Risk Premium API
Access the market risk premium for specific dates with the FMP Market Risk Premium API. Use this key financial metric to assess the additional return expected from investing in the stock market over a risk-free investment.

Endpoint:

https://financialmodelingprep.com/stable/market-risk-premium

ESG
ESG Investment Search API
USA Flag
Align your investments with your values using the FMP ESG Investment Search API. Discover companies and funds based on Environmental, Social, and Governance (ESG) scores, performance, controversies, and business involvement criteria.

Endpoint:

https://financialmodelingprep.com/stable/esg-disclosures?symbol=AAPL

Parameters

ESG Ratings API
USA Flag
Access comprehensive ESG ratings for companies and funds with the FMP ESG Ratings API. Make informed investment decisions based on environmental, social, and governance (ESG) performance data.

Endpoint:

https://financialmodelingprep.com/stable/esg-ratings?symbol=AAPL

Parameters

ESG Benchmark Comparison API
USA Flag
Evaluate the ESG performance of companies and funds with the FMP ESG Benchmark Comparison API. Compare ESG leaders and laggards within industries to make informed and responsible investment decisions.

Endpoint:

https://financialmodelingprep.com/stable/esg-benchmark

Parameters

Etf And Mutual Funds
ETF & Fund Holdings API
Globe Flag
Get a detailed breakdown of the assets held within ETFs and mutual funds using the FMP ETF & Fund Holdings API. Access real-time data on the specific securities and their weights in the portfolio, providing insights into asset composition and fund strategies.

Endpoint:

https://financialmodelingprep.com/stable/etf/holdings?symbol=SPY

Parameters

ETF & Mutual Fund Information API
Globe Flag
Access comprehensive data on ETFs and mutual funds with the FMP ETF & Mutual Fund Information API. Retrieve essential details such as ticker symbol, fund name, expense ratio, assets under management, and more.

Endpoint:

https://financialmodelingprep.com/stable/etf/info?symbol=SPY

Parameters

ETF & Fund Country Allocation API
Globe Flag
Gain insight into how ETFs and mutual funds distribute assets across different countries with the FMP ETF & Fund Country Allocation API. This tool provides detailed information on the percentage of assets allocated to various regions, helping you make informed investment decisions.

Endpoint:

https://financialmodelingprep.com/stable/etf/country-weightings?symbol=SPY

Parameters

ETF Asset Exposure API
Globe Flag
Discover which ETFs hold specific stocks with the FMP ETF Asset Exposure API. Access detailed information on market value, share numbers, and weight percentages for assets within ETFs.

Endpoint:

https://financialmodelingprep.com/stable/etf/asset-exposure?symbol=AAPL

Parameters

ETF Sector Weighting API
Globe Flag
The FMP ETF Sector Weighting API provides a breakdown of the percentage of an ETF's assets that are invested in each sector. For example, an investor may want to invest in an ETF that has a high exposure to the technology sector if they believe that the technology sector is poised for growth.

Endpoint:

https://financialmodelingprep.com/stable/etf/sector-weightings?symbol=SPY

Parameters

Mutual Fund & ETF Disclosure API
USA Flag
Access the latest disclosures from mutual funds and ETFs with the FMP Mutual Fund & ETF Disclosure API. This API provides updates on filings, changes in holdings, and other critical disclosure data for mutual funds and ETFs.

Endpoint:

https://financialmodelingprep.com/stable/funds/disclosure-holders-latest?symbol=AAPL

Parameters

Mutual Fund Disclosures API
USA Flag
Access comprehensive disclosure data for mutual funds with the FMP Mutual Fund Disclosures API. Analyze recent filings, balance sheets, and financial reports to gain insights into mutual fund portfolios.

Endpoint:

https://financialmodelingprep.com/stable/funds/disclosure?symbol=VWO&year=2023&quarter=4

Parameters

Mutual Fund & ETF Disclosure Name Search API
USA Flag
Easily search for mutual fund and ETF disclosures by name using the Mutual Fund & ETF Disclosure Name Search API. This API allows you to find specific reports and filings based on the fund or ETF name, providing essential details like CIK number, entity information, and reporting file number.

Endpoint:

https://financialmodelingprep.com/stable/funds/disclosure-holders-search?name=Federated Hermes Government Income Securities, Inc.

Parameters

Fund & ETF Disclosures by Date API
USA Flag
Retrieve detailed disclosures for mutual funds and ETFs based on filing dates with the FMP Fund & ETF Disclosures by Date API. Stay current with the latest filings and track regulatory updates effectively.

Endpoint:

https://financialmodelingprep.com/stable/funds/disclosure-dates?symbol=VWO

Parameters

Commodity
Commodities List API
Access an extensive list of tracked commodities across various sectors, including energy, metals, and agricultural products. The FMP Commodities List API provides essential data on tradable commodities, giving investors the ability to explore market options in real-time.

Endpoint:

https://financialmodelingprep.com/stable/commodities-list

Commodities Quote API
USA Flag
Access real-time price quotes for all commodities traded worldwide with the FMP Global Commodities Quotes API. Track market movements and identify investment opportunities with comprehensive price data.

Endpoint:

https://financialmodelingprep.com/stable/quote?symbol=GCUSD

Parameters

Commodities Quote Short API
USA Flag
Get fast and accurate quotes for commodities with the FMP Commodities Quick Quote API. Instantly access the current price, recent changes, and trading volume for various commodities in real-time.

Endpoint:

https://financialmodelingprep.com/stable/quote-short?symbol=GCUSD

Parameters

All Commodities Quotes API
Access real-time quotes for multiple commodities at once with the FMP Real-Time Batch Commodities Quotes API. Instantly track price changes, volume, and other key metrics for a broad range of commodities.

Endpoint:

https://financialmodelingprep.com/stable/batch-commodity-quotes

Parameters

Light Chart API
Access historical end-of-day prices for various commodities with the FMP Historical Commodities Price API. Analyze past price movements, trading volume, and trends to support informed decision-making.

Endpoint:

https://financialmodelingprep.com/stable/historical-price-eod/light?symbol=GCUSD

Parameters

Full Chart API
Access full historical end-of-day price data for commodities with the FMP Comprehensive Commodities Price API. This API enables users to analyze long-term price trends, patterns, and market movements in great detail.

Endpoint:

https://financialmodelingprep.com/stable/historical-price-eod/full?symbol=GCUSD

Parameters

1-Minute Interval Commodities Chart API
Track real-time, short-term price movements for commodities with the FMP 1-Minute Interval Commodities Chart API. This API provides detailed 1-minute interval data, enabling precise monitoring of intraday market changes.

Endpoint:

https://financialmodelingprep.com/stable/historical-chart/1min?symbol=GCUSD

Parameters

5-Minute Interval Commodities Chart API
Monitor short-term price movements with the FMP 5-Minute Interval Commodities Chart API. This API provides detailed 5-minute interval data, enabling users to track near-term price trends for more strategic trading and investment decisions.

Endpoint:

https://financialmodelingprep.com/stable/historical-chart/5min?symbol=GCUSD

Parameters

1-Hour Interval Commodities Chart API
Monitor hourly price movements and trends with the FMP 1-Hour Interval Commodities Chart API. This API provides hourly data, offering a detailed look at price fluctuations throughout the trading day to support mid-term trading strategies and market analysis.

Endpoint:

https://financialmodelingprep.com/stable/historical-chart/1hour?symbol=GCUSD

Parameters

Fundraisers
Latest Crowdfunding Campaigns API
USA Flag
Discover the most recent crowdfunding campaigns with the FMP Latest Crowdfunding Campaigns API. Stay informed on which companies and projects are actively raising funds, their financial details, and offering terms.

Endpoint:

https://financialmodelingprep.com/stable/crowdfunding-offerings-latest?page=0&limit=100

Parameters

Crowdfunding Campaign Search API
USA Flag
Search for crowdfunding campaigns by company name, campaign name, or platform with the FMP Crowdfunding Campaign Search API. Access detailed information to track and analyze crowdfunding activities.

Endpoint:

https://financialmodelingprep.com/stable/crowdfunding-offerings-search?name=enotap

Parameters

Crowdfunding By CIK API
USA Flag
Access detailed information on all crowdfunding campaigns launched by a specific company with the FMP Crowdfunding By CIK API.

Endpoint:

https://financialmodelingprep.com/stable/crowdfunding-offerings?cik=0001916078

Parameters

Equity Offering Updates API
USA Flag
Stay informed about the latest equity offerings with the FMP Equity Offering Updates API. Track new shares being issued by companies and get insights into exempt offerings and amendments.

Endpoint:

https://financialmodelingprep.com/stable/fundraising-latest?page=0&limit=10

Parameters

Equity Offering Search API
USA Flag
Easily search for equity offerings by company name or stock symbol with the FMP Equity Offering Search API. Access detailed information about recent share issuances to stay informed on company fundraising activities.

Endpoint:

https://financialmodelingprep.com/stable/fundraising-search?name=NJOY

Parameters

Equity Offering By CIK API
USA Flag
Access detailed information on equity offerings announced by specific companies with the FMP Company Equity Offerings by CIK API. Track offering activity and identify potential investment opportunities.

Endpoint:

https://financialmodelingprep.com/stable/fundraising?cik=0001547416

Parameters

Crypto
Cryptocurrency List API
Access a comprehensive list of all cryptocurrencies traded on exchanges worldwide with the FMP Cryptocurrencies Overview API. Get detailed information on each cryptocurrency to inform your investment strategies.

Endpoint:

https://financialmodelingprep.com/stable/cryptocurrency-list

Full Cryptocurrency Quote API
Access real-time quotes for all cryptocurrencies with the FMP Full Cryptocurrency Quote API. Obtain comprehensive price data including current, high, low, and open prices.

Endpoint:

https://financialmodelingprep.com/stable/quote?symbol=BTCUSD

Parameters

Cryptocurrency Quote Short API
Access real-time cryptocurrency quotes with the FMP Cryptocurrency Quick Quote API. Get a concise overview of current crypto prices, changes, and trading volume for a wide range of digital assets.

Endpoint:

https://financialmodelingprep.com/stable/quote-short?symbol=BTCUSD

Parameters

All Cryptocurrencies Quotes API
Access live price data for a wide range of cryptocurrencies with the FMP Real-Time Cryptocurrency Batch Quotes API. Get real-time updates on prices, market changes, and trading volumes for digital assets in a single request.

Endpoint:

https://financialmodelingprep.com/stable/batch-crypto-quotes

Parameters

Historical Cryptocurrency Light Chart API
Access historical end-of-day prices for a variety of cryptocurrencies with the Historical Cryptocurrency Price Snapshot API. Track trends in price and trading volume over time to better understand market behavior.

Endpoint:

https://financialmodelingprep.com/stable/historical-price-eod/light?symbol=BTCUSD

Parameters

Historical Cryptocurrency Full Chart API
Access comprehensive end-of-day (EOD) price data for cryptocurrencies with the Full Historical Cryptocurrency Data API. Analyze long-term price trends, market movements, and trading volumes to inform strategic decisions.

Endpoint:

https://financialmodelingprep.com/stable/historical-price-eod/full?symbol=BTCUSD

Parameters

1-Minute Interval Cryptocurrency Data API
Get real-time, 1-minute interval price data for cryptocurrencies with the 1-Minute Cryptocurrency Intraday Data API. Monitor short-term price fluctuations and trading volume to stay updated on market movements.

Endpoint:

https://financialmodelingprep.com/stable/historical-chart/1min?symbol=BTCUSD

Parameters

5-Minute Interval Cryptocurrency Data API
Analyze short-term price trends with the 5-Minute Interval Cryptocurrency Data API. Access real-time, intraday price data for cryptocurrencies to monitor rapid market movements and optimize trading strategies.

Endpoint:

https://financialmodelingprep.com/stable/historical-chart/5min?symbol=BTCUSD

Parameters

1-Hour Interval Cryptocurrency Data API
Access detailed 1-hour intraday price data for cryptocurrencies with the 1-Hour Interval Cryptocurrency Data API. Track hourly price movements to gain insights into market trends and make informed trading decisions throughout the day.

Endpoint:

https://financialmodelingprep.com/stable/historical-chart/1hour?symbol=BTCUSD

Parameters

Forex
Forex Currency Pairs API
Access a comprehensive list of all currency pairs traded on the forex market with the FMP Forex Currency Pairs API. Analyze and track the performance of currency pairs to make informed investment decisions.

Endpoint:

https://financialmodelingprep.com/stable/forex-list

Forex Quote API
USA Flag
Access real-time forex quotes for currency pairs with the Forex Quote API. Retrieve up-to-date information on exchange rates and price changes to help monitor market movements.

Endpoint:

https://financialmodelingprep.com/stable/quote?symbol=EURUSD

Parameters

Forex Short Quote API
USA Flag
Quickly access concise forex pair quotes with the Forex Quote Snapshot API. Get a fast look at live currency exchange rates, price changes, and volume in real time.

Endpoint:

https://financialmodelingprep.com/stable/quote-short?symbol=EURUSD

Parameters

Batch Forex Quotes API
Easily access real-time quotes for multiple forex pairs simultaneously with the Batch Forex Quotes API. Stay updated on global currency exchange rates and monitor price changes across different markets.

Endpoint:

https://financialmodelingprep.com/stable/batch-forex-quotes

Parameters

Historical Forex Light Chart API
Access historical end-of-day forex prices with the Historical Forex Light Chart API. Track long-term price trends across different currency pairs to enhance your trading and analysis strategies.

Endpoint:

https://financialmodelingprep.com/stable/historical-price-eod/light?symbol=EURUSD

Parameters

Historical Forex Full Chart API
Access comprehensive historical end-of-day forex price data with the Full Historical Forex Chart API. Gain detailed insights into currency pair movements, including open, high, low, close (OHLC) prices, volume, and percentage changes.

Endpoint:

https://financialmodelingprep.com/stable/historical-price-eod/full?symbol=EURUSD

Parameters

1-Minute Interval Forex Chart API
Access real-time 1-minute intraday forex data with the 1-Minute Forex Interval Chart API. Track short-term price movements for precise, up-to-the-minute insights on currency pair fluctuations.

Endpoint:

https://financialmodelingprep.com/stable/historical-chart/1min?symbol=EURUSD

Parameters

5-Minute Interval Forex Chart API
Track short-term forex trends with the 5-Minute Forex Interval Chart API. Access detailed 5-minute intraday data to monitor currency pair price movements and market conditions in near real-time.

Endpoint:

https://financialmodelingprep.com/stable/historical-chart/5min?symbol=EURUSD

Parameters

1-Hour Interval Forex Chart API
Track forex price movements over the trading day with the 1-Hour Forex Interval Chart API. This tool provides hourly intraday data for currency pairs, giving a detailed view of trends and market shifts.

Endpoint:

https://financialmodelingprep.com/stable/historical-chart/1hour?symbol=EURUSD

Parameters

Statements
Income Statement API
Globe Flag
Access real-time income statement data for public companies, private companies, and ETFs with the FMP Real-Time Income Statements API. Track profitability, compare competitors, and identify business trends with up-to-date financial data.

Endpoint:

https://financialmodelingprep.com/stable/income-statement?symbol=AAPL

Parameters

Balance Sheet Statement API
Globe Flag
Access detailed balance sheet statements for publicly traded companies with the Balance Sheet Data API. Analyze assets, liabilities, and shareholder equity to gain insights into a company's financial health.

Endpoint:

https://financialmodelingprep.com/stable/balance-sheet-statement?symbol=AAPL

Parameters

Cash Flow Statement API
Globe Flag
Gain insights into a company's cash flow activities with the Cash Flow Statements API. Analyze cash generated and used from operations, investments, and financing activities to evaluate the financial health and sustainability of a business.

Endpoint:

https://financialmodelingprep.com/stable/cash-flow-statement?symbol=AAPL

Parameters

Latest Financial Statements API
Globe Flag
Endpoint:

https://financialmodelingprep.com/stable/latest-financial-statements?page=0&limit=250

Parameters

Income Statements TTM API
Globe Flag
Endpoint:

https://financialmodelingprep.com/stable/income-statement-ttm?symbol=AAPL

Parameters

Balance Sheet Statements TTM API
Globe Flag
Endpoint:

https://financialmodelingprep.com/stable/balance-sheet-statement-ttm?symbol=AAPL

Parameters

Cashflow Statements TTM API
Globe Flag
Endpoint:

https://financialmodelingprep.com/stable/cash-flow-statement-ttm?symbol=AAPL

Parameters

Key Metrics API
Globe Flag
Access essential financial metrics for a company with the FMP Financial Key Metrics API. Evaluate revenue, net income, P/E ratio, and more to assess performance and compare it to competitors.

Endpoint:

https://financialmodelingprep.com/stable/key-metrics?symbol=AAPL

Parameters

Financial Ratios API
Globe Flag
Analyze a company's financial performance using the Financial Ratios API. This API provides detailed profitability, liquidity, and efficiency ratios, enabling users to assess a company's operational and financial health across various metrics.

Endpoint:

https://financialmodelingprep.com/stable/ratios?symbol=AAPL

Parameters

Key Metrics TTM API
Globe Flag
Retrieve a comprehensive set of trailing twelve-month (TTM) key performance metrics with the TTM Key Metrics API. Access data related to a company's profitability, capital efficiency, and liquidity, allowing for detailed analysis of its financial health over the past year.

Endpoint:

https://financialmodelingprep.com/stable/key-metrics-ttm?symbol=AAPL

Parameters

Financial Ratios TTM API
Globe Flag
Gain access to trailing twelve-month (TTM) financial ratios with the TTM Ratios API. This API provides key performance metrics over the past year, including profitability, liquidity, and efficiency ratios.

Endpoint:

https://financialmodelingprep.com/stable/ratios-ttm?symbol=AAPL

Parameters

Financial Scores API
Globe Flag
Assess a company's financial strength using the Financial Health Scores API. This API provides key metrics such as the Altman Z-Score and Piotroski Score, giving users insights into a company’s overall financial health and stability.

Endpoint:

https://financialmodelingprep.com/stable/financial-scores?symbol=AAPL

Parameters

Owner Earnings API
Globe Flag
Retrieve a company's owner earnings with the Owner Earnings API, which provides a more accurate representation of cash available to shareholders by adjusting net income. This metric is crucial for evaluating a company’s profitability from the perspective of investors.

Endpoint:

https://financialmodelingprep.com/stable/owner-earnings?symbol=AAPL

Parameters

Enterprise Values API
Globe Flag
Access a company's enterprise value using the Enterprise Values API. This metric offers a comprehensive view of a company's total market value by combining both its equity (market capitalization) and debt, providing a better understanding of its worth.

Endpoint:

https://financialmodelingprep.com/stable/enterprise-values?symbol=AAPL

Parameters

Income Statement Growth API
Globe Flag
Track key financial growth metrics with the Income Statement Growth API. Analyze how revenue, profits, and expenses have evolved over time, offering insights into a company’s financial health and operational efficiency.

Endpoint:

https://financialmodelingprep.com/stable/income-statement-growth?symbol=AAPL

Parameters

Balance Sheet Statement Growth API
Globe Flag
Analyze the growth of key balance sheet items over time with the Balance Sheet Statement Growth API. Track changes in assets, liabilities, and equity to understand the financial evolution of a company.

Endpoint:

https://financialmodelingprep.com/stable/balance-sheet-statement-growth?symbol=AAPL

Parameters

Cashflow Statement Growth API
Globe Flag
Measure the growth rate of a company’s cash flow with the FMP Cashflow Statement Growth API. Determine how quickly a company’s cash flow is increasing or decreasing over time.

Endpoint:

https://financialmodelingprep.com/stable/cash-flow-statement-growth?symbol=AAPL

Parameters

Financial Statement Growth API
Globe Flag
Analyze the growth of key financial statement items across income, balance sheet, and cash flow statements with the Financial Statement Growth API. Track changes over time to understand trends in financial performance.

Endpoint:

https://financialmodelingprep.com/stable/financial-growth?symbol=AAPL

Parameters

Financial Reports Dates API
Endpoint:

https://financialmodelingprep.com/stable/financial-reports-dates?symbol=AAPL

Parameters

Financial Reports Form 10-K JSON API
Access comprehensive annual reports with the FMP Annual Reports on Form 10-K API. Obtain detailed information about a company’s financial performance, business operations, and risk factors as reported to the SEC.

Endpoint:

https://financialmodelingprep.com/stable/financial-reports-json?symbol=AAPL&year=2022&period=FY

Parameters

Financial Reports Form 10-K XLSX API
Download detailed 10-K reports in XLSX format with the Financial Reports Form 10-K XLSX API. Effortlessly access and analyze annual financial data for companies in a spreadsheet-friendly format.

Endpoint:

https://financialmodelingprep.com/stable/financial-reports-xlsx?symbol=AAPL&year=2022&period=FY

Parameters

Revenue Product Segmentation API
Access detailed revenue breakdowns by product line with the Revenue Product Segmentation API. Understand which products drive a company's earnings and get insights into the performance of individual product segments.

Endpoint:

https://financialmodelingprep.com/stable/revenue-product-segmentation?symbol=AAPL

Parameters

Revenue Geographic Segments API
Access detailed revenue breakdowns by geographic region with the Revenue Geographic Segments API. Analyze how different regions contribute to a company’s total revenue and identify key markets for growth.

Endpoint:

https://financialmodelingprep.com/stable/revenue-geographic-segmentation?symbol=AAPL

Parameters

As Reported Income Statements API
Retrieve income statements as they were reported by the company with the As Reported Income Statements API. Access raw financial data directly from official company filings, including revenue, expenses, and net income.

Endpoint:

https://financialmodelingprep.com/stable/income-statement-as-reported?symbol=AAPL

Parameters

As Reported Balance Statements API
Access balance sheets as reported by the company with the As Reported Balance Statements API. View detailed financial data on assets, liabilities, and equity directly from official filings.

Endpoint:

https://financialmodelingprep.com/stable/balance-sheet-statement-as-reported?symbol=AAPL

Parameters

As Reported Cashflow Statements API
View cash flow statements as reported by the company with the As Reported Cash Flow Statements API. Analyze a company's cash flows related to operations, investments, and financing directly from official reports.

Endpoint:

https://financialmodelingprep.com/stable/cash-flow-statement-as-reported?symbol=AAPL

Parameters

As Reported Financial Statements API
Retrieve comprehensive financial statements as reported by companies with FMP As Reported Financial Statements API. Access complete data across income, balance sheet, and cash flow statements in their original form for detailed analysis.

Endpoint:

https://financialmodelingprep.com/stable/financial-statement-full-as-reported?symbol=AAPL

Parameters

Form 13F
Institutional Ownership Filings API
USA Flag
Stay up to date with the most recent SEC filings related to institutional ownership using the Institutional Ownership Filings API. This tool allows you to track the latest reports and disclosures from institutional investors, giving you a real-time view of major holdings and regulatory submissions.

Endpoint:

https://financialmodelingprep.com/stable/institutional-ownership/latest?page=0&limit=100

Parameters

Filings Extract API
USA Flag
The Filings Extract API allows users to extract detailed data directly from official SEC filings. This API provides access to key information such as company shares, security details, and filing links, making it easier to analyze corporate disclosures.

Endpoint:

https://financialmodelingprep.com/stable/institutional-ownership/extract?cik=0001388838&year=2023&quarter=3

Parameters

Form 13F Filings Dates API
USA Flag
The Form 13F Filings Dates API allows you to retrieve dates associated with Form 13F filings by institutional investors. This is crucial for tracking stock holdings of institutional investors at specific points in time, providing valuable insights into their investment strategies.

Endpoint:

https://financialmodelingprep.com/stable/institutional-ownership/dates?cik=0001067983

Parameters

Filings Extract With Analytics By Holder API
USA Flag
The Filings Extract With Analytics By Holder API provides an analytical breakdown of institutional filings. This API offers insight into stock movements, strategies, and portfolio changes by major institutional holders, helping you understand their investment behavior and track significant changes in stock ownership.

Endpoint:

https://financialmodelingprep.com/stable/institutional-ownership/extract-analytics/holder?symbol=AAPL&year=2023&quarter=3&page=0&limit=10

Parameters

Holder Performance Summary API
USA Flag
The Holder Performance Summary API provides insights into the performance of institutional investors based on their stock holdings. This data helps track how well institutional holders are performing, their portfolio changes, and how their performance compares to benchmarks like the S&P 500.

Endpoint:

https://financialmodelingprep.com/stable/institutional-ownership/holder-performance-summary?cik=0001067983&page=0

Parameters

Holders Industry Breakdown API
USA Flag
The Holders Industry Breakdown API provides an overview of the sectors and industries that institutional holders are investing in. This API helps analyze how institutional investors distribute their holdings across different industries and track changes in their investment strategies over time.

Endpoint:

https://financialmodelingprep.com/stable/institutional-ownership/holder-industry-breakdown?cik=0001067983&year=2023&quarter=3

Parameters

Positions Summary API
USA Flag
The Positions Summary API provides a comprehensive snapshot of institutional holdings for a specific stock symbol. It tracks key metrics like the number of investors holding the stock, changes in the number of shares, total investment value, and ownership percentages over time.

Endpoint:

https://financialmodelingprep.com/stable/institutional-ownership/symbol-positions-summary?symbol=AAPL&year=2023&quarter=3

Parameters

Industry Performance Summary API
USA Flag
The Industry Performance Summary API provides an overview of how various industries are performing financially. By analyzing the value of industries over a specific period, this API helps investors and analysts understand the health of entire sectors and make informed decisions about sector-based investments.

Endpoint:

https://financialmodelingprep.com/stable/institutional-ownership/industry-summary?year=2023&quarter=3

Parameters

Indexes
Stock Market Indexes List API
Retrieve a comprehensive list of stock market indexes across global exchanges using the FMP Stock Market Indexes List API. This API provides essential information such as the symbol, name, exchange, and currency for each index, helping analysts and investors keep track of various market benchmarks.

Endpoint:

https://financialmodelingprep.com/stable/index-list

Index Quote API
USA Flag
Access real-time stock index quotes with the Stock Index Quote API. Stay updated with the latest price changes, daily highs and lows, volume, and other key metrics for major stock indices around the world.

Endpoint:

https://financialmodelingprep.com/stable/quote?symbol=^GSPC

Parameters

Index Short Quote API
USA Flag
Access concise stock index quotes with the Stock Index Short Quote API. This API provides a snapshot of the current price, change, and volume for stock indexes, making it ideal for users who need a quick overview of market movements.

Endpoint:

https://financialmodelingprep.com/stable/quote-short?symbol=^GSPC

Parameters

All Index Quotes API
The All Index Quotes API provides real-time quotes for a wide range of stock indexes, from major market benchmarks to niche indexes. This API allows users to track market performance across multiple indexes in a single request, giving them a broad view of the financial markets.

Endpoint:

https://financialmodelingprep.com/stable/batch-index-quotes

Parameters

Historical Index Light Chart API
Retrieve end-of-day historical prices for stock indexes using the Historical Price Data API. This API provides essential data such as date, price, and volume, enabling detailed analysis of price movements over time.

Endpoint:

https://financialmodelingprep.com/stable/historical-price-eod/light?symbol=^GSPC

Parameters

Historical Index Full Chart API
Access full historical end-of-day prices for stock indexes using the Detailed Historical Price Data API. This API provides comprehensive information, including open, high, low, close prices, volume, and additional metrics for detailed financial analysis.

Endpoint:

https://financialmodelingprep.com/stable/historical-price-eod/full?symbol=^GSPC

Parameters

1-Minute Interval Index Price API
Retrieve 1-minute interval intraday data for stock indexes using the Intraday 1-Minute Price Data API. This API provides granular price information, helping users track short-term price movements and trading volume within each minute.

Endpoint:

https://financialmodelingprep.com/stable/historical-chart/1min?symbol=^GSPC

Parameters

5-Minute Interval Index Price API
Retrieve 5-minute interval intraday price data for stock indexes using the Intraday 5-Minute Price Data API. This API provides crucial insights into price movements and trading volume within 5-minute windows, ideal for traders who require short-term data.

Endpoint:

https://financialmodelingprep.com/stable/historical-chart/5min?symbol=^GSPC

Parameters

1-Hour Interval Index Price API
Access 1-hour interval intraday data for stock indexes using the Intraday 1-Hour Price Data API. This API provides detailed price movements and volume within hourly intervals, making it ideal for tracking medium-term market trends during the trading day.

Endpoint:

https://financialmodelingprep.com/stable/historical-chart/1hour?symbol=^GSPC

Parameters

S&P 500 Index API
Access detailed data on the S&P 500 index using the S&P 500 Index API. Track the performance and key information of the companies that make up this major stock market index.

Endpoint:

https://financialmodelingprep.com/stable/sp500-constituent

Nasdaq Index API
Access comprehensive data for the Nasdaq index with the Nasdaq Index API. Monitor real-time movements and track the historical performance of companies listed on this prominent stock exchange.

Endpoint:

https://financialmodelingprep.com/stable/nasdaq-constituent

Dow Jones API
Access data on the Dow Jones Industrial Average using the Dow Jones API. Track current values, analyze trends, and get detailed information about the companies that make up this important stock index.

Endpoint:

https://financialmodelingprep.com/stable/dowjones-constituent

Historical S&P 500 API
Retrieve historical data for the S&P 500 index using the Historical S&P 500 API. Analyze past changes in the index, including additions and removals of companies, to understand trends and performance over time.

Endpoint:

https://financialmodelingprep.com/stable/historical-sp500-constituent

Historical Nasdaq API
Access historical data for the Nasdaq index using the Historical Nasdaq API. Analyze changes in the index composition and view how it has evolved over time, including company additions and removals.

Endpoint:

https://financialmodelingprep.com/stable/historical-nasdaq-constituent

Historical Dow Jones API
Access historical data for the Dow Jones Industrial Average using the Historical Dow Jones API. Analyze changes in the index’s composition and study its performance across different periods.

Endpoint:

https://financialmodelingprep.com/stable/historical-dowjones-constituent

Insider Trades
Latest Insider Trading API
USA Flag
Access the latest insider trading activity using the Latest Insider Trading API. Track which company insiders are buying or selling stocks and analyze their transactions.

Endpoint:

https://financialmodelingprep.com/stable/insider-trading/latest?page=0&limit=100

Parameters

Search Insider Trades API
USA Flag
Search insider trading activity by company or symbol using the Search Insider Trades API. Find specific trades made by corporate insiders, including executives and directors.

Endpoint:

https://financialmodelingprep.com/stable/insider-trading/search?page=0&limit=100

Parameters

Search Insider Trades by Reporting Name API
USA Flag
Search for insider trading activity by reporting name using the Search Insider Trades by Reporting Name API. Track trading activities of specific individuals or groups involved in corporate insider transactions.

Endpoint:

https://financialmodelingprep.com/stable/insider-trading/reporting-name?name=Zuckerberg

Parameters

All Insider Transaction Types API
USA Flag
Access a comprehensive list of insider transaction types with the All Insider Transaction Types API. This API provides details on various transaction actions, including purchases, sales, and other corporate actions involving insider trading.

Endpoint:

https://financialmodelingprep.com/stable/insider-trading-transaction-type

Insider Trade Statistics API
USA Flag
Analyze insider trading activity with the Insider Trade Statistics API. This API provides key statistics on insider transactions, including total purchases, sales, and trends for specific companies or stock symbols.

Endpoint:

https://financialmodelingprep.com/stable/insider-trading/statistics?symbol=AAPL

Parameters

Acquisition Ownership API
USA Flag
Track changes in stock ownership during acquisitions using the Acquisition Ownership API. This API provides detailed information on how mergers, takeovers, or beneficial ownership changes impact the stock ownership structure of a company.

Endpoint:

https://financialmodelingprep.com/stable/acquisition-of-beneficial-ownership?symbol=AAPL

Parameters

Market Performance
Market Sector Performance Snapshot API
Globe Flag
Get a snapshot of sector performance using the Market Sector Performance Snapshot API. Analyze how different industries are performing in the market based on average changes across sectors.

Endpoint:

https://financialmodelingprep.com/stable/sector-performance-snapshot?date=2024-02-01

Parameters

Industry Performance Snapshot API
Globe Flag
Access detailed performance data by industry using the Industry Performance Snapshot API. Analyze trends, movements, and daily performance metrics for specific industries across various stock exchanges.

Endpoint:

https://financialmodelingprep.com/stable/industry-performance-snapshot?date=2024-02-01

Parameters

Historical Market Sector Performance API
Globe Flag
Access historical sector performance data using the Historical Market Sector Performance API. Review how different sectors have performed over time across various stock exchanges.

Endpoint:

https://financialmodelingprep.com/stable/historical-sector-performance?sector=Energy

Parameters

Historical Industry Performance API
Globe Flag
Access historical performance data for industries using the Historical Industry Performance API. Track long-term trends and analyze how different industries have evolved over time across various stock exchanges.

Endpoint:

https://financialmodelingprep.com/stable/historical-industry-performance?industry=Biotechnology

Parameters

Sector PE Snapshot API
Globe Flag
Retrieve the price-to-earnings (P/E) ratios for various sectors using the Sector P/E Snapshot API. Compare valuation levels across sectors to better understand market valuations.

Endpoint:

https://financialmodelingprep.com/stable/sector-pe-snapshot?date=2024-02-01

Parameters

Industry PE Snapshot API
Globe Flag
View price-to-earnings (P/E) ratios for different industries using the Industry P/E Snapshot API. Analyze valuation levels across various industries to understand how each is priced relative to its earnings.

Endpoint:

https://financialmodelingprep.com/stable/industry-pe-snapshot?date=2024-02-01

Parameters

Historical Sector PE API
Globe Flag
Access historical price-to-earnings (P/E) ratios for various sectors using the Historical Sector P/E API. Analyze how sector valuations have evolved over time to understand long-term trends and market shifts.

Endpoint:

https://financialmodelingprep.com/stable/historical-sector-pe?sector=Energy

Parameters

Historical Industry PE API
Globe Flag
Access historical price-to-earnings (P/E) ratios by industry using the Historical Industry P/E API. Track valuation trends across various industries to understand how market sentiment and valuations have evolved over time.

Endpoint:

https://financialmodelingprep.com/stable/historical-industry-pe?industry=Biotechnology

Parameters

Biggest Stock Gainers API
USA Flag
Track the stocks with the largest price increases using the Top Stock Gainers API. Identify the companies that are leading the market with significant price surges, offering potential growth opportunities.

Endpoint:

https://financialmodelingprep.com/stable/biggest-gainers

Biggest Stock Losers API
USA Flag
Access data on the stocks with the largest price drops using the Biggest Stock Losers API. Identify companies experiencing significant declines and track the stocks that are falling the fastest in the market.

Endpoint:

https://financialmodelingprep.com/stable/biggest-losers

Top Traded Stocks API
USA Flag
View the most actively traded stocks using the Top Traded Stocks API. Identify the companies experiencing the highest trading volumes in the market and track where the most trading activity is happening.

Endpoint:

https://financialmodelingprep.com/stable/most-actives

Market Hours
Global Exchange Market Hours API
Globe Flag
Retrieve trading hours for specific stock exchanges using the Global Exchange Market Hours API. Find out the opening and closing times of global exchanges to plan your trading strategies effectively.

Endpoint:

https://financialmodelingprep.com/stable/exchange-market-hours?exchange=NASDAQ

Parameters

Holidays By Exchange API
Globe Flag
Endpoint:

https://financialmodelingprep.com/stable/holidays-by-exchange?exchange=NASDAQ

Parameters

All Exchange Market Hours API
Globe Flag
View the market hours for all exchanges. Check when different markets are active.

Endpoint:

https://financialmodelingprep.com/stable/all-exchange-market-hours

News
FMP Articles API
USA Flag
Access the latest articles from Financial Modeling Prep with the FMP Articles API. Get comprehensive updates including headlines, snippets, and publication URLs.

Endpoint:

https://financialmodelingprep.com/stable/fmp-articles?page=0&limit=20

Parameters

General News API
Globe Flag
Access the latest general news articles from a variety of sources with the FMP General News API. Obtain headlines, snippets, and publication URLs for comprehensive news coverage.

Endpoint:

https://financialmodelingprep.com/stable/news/general-latest?page=0&limit=20

Parameters

Press Releases API
USA Flag
Access official company press releases with the FMP Press Releases API. Get real-time updates on corporate announcements, earnings reports, mergers, and more.

Endpoint:

https://financialmodelingprep.com/stable/news/press-releases-latest?page=0&limit=20

Parameters

Stock News API
Stay informed with the latest stock market news using the FMP Stock News Feed API. Access headlines, snippets, publication URLs, and ticker symbols for the most recent articles from a variety of sources.

Endpoint:

https://financialmodelingprep.com/stable/news/stock-latest?page=0&limit=20

Parameters

Crypto News API
Stay informed with the latest cryptocurrency news using the FMP Crypto News API. Access a curated list of articles from various sources, including headlines, snippets, and publication URLs.

Endpoint:

https://financialmodelingprep.com/stable/news/crypto-latest?page=0&limit=20

Parameters

Forex News API
Stay updated with the latest forex news articles from various sources using the FMP Forex News API. Access headlines, snippets, and publication URLs for comprehensive market insights.

Endpoint:

https://financialmodelingprep.com/stable/news/forex-latest?page=0&limit=20

Parameters

Search Press Releases API
USA Flag
Search for company press releases with the FMP Search Press Releases API. Find specific corporate announcements and updates by entering a stock symbol or company name.

Endpoint:

https://financialmodelingprep.com/stable/news/press-releases?symbols=AAPL

Parameters

Search Stock News API
Search for stock-related news using the FMP Search Stock News API. Find specific stock news by entering a ticker symbol or company name to track the latest developments.

Endpoint:

https://financialmodelingprep.com/stable/news/stock?symbols=AAPL

Parameters

Search Crypto News API
Search for cryptocurrency news using the FMP Search Crypto News API. Retrieve news related to specific coins or tokens by entering their name or symbol.

Endpoint:

https://financialmodelingprep.com/stable/news/crypto?symbols=BTCUSD

Parameters

Search Forex News API
Search for foreign exchange news using the FMP Search Forex News API. Find targeted news on specific currency pairs by entering their symbols for focused updates.

Endpoint:

https://financialmodelingprep.com/stable/news/forex?symbols=EURUSD

Parameters

Technical Indicators
Simple Moving Average API
Globe Flag
Endpoint:

https://financialmodelingprep.com/stable/technical-indicators/sma?symbol=AAPL&periodLength=10&timeframe=1day

Parameters

Exponential Moving Average API
Globe Flag
Endpoint:

https://financialmodelingprep.com/stable/technical-indicators/ema?symbol=AAPL&periodLength=10&timeframe=1day

Parameters

Weighted Moving Average API
Globe Flag
Endpoint:

https://financialmodelingprep.com/stable/technical-indicators/wma?symbol=AAPL&periodLength=10&timeframe=1day

Parameters

Double Exponential Moving Average API
Globe Flag
Endpoint:

https://financialmodelingprep.com/stable/technical-indicators/dema?symbol=AAPL&periodLength=10&timeframe=1day

Parameters

Triple Exponential Moving Average API
Globe Flag
Endpoint:

https://financialmodelingprep.com/stable/technical-indicators/tema?symbol=AAPL&periodLength=10&timeframe=1day

Parameters

Relative Strength Index API
Globe Flag
Endpoint:

https://financialmodelingprep.com/stable/technical-indicators/rsi?symbol=AAPL&periodLength=10&timeframe=1day

Parameters

Standard Deviation API
Globe Flag
Endpoint:

https://financialmodelingprep.com/stable/technical-indicators/standarddeviation?symbol=AAPL&periodLength=10&timeframe=1day

Parameters

Williams API
Globe Flag
Endpoint:

https://financialmodelingprep.com/stable/technical-indicators/williams?symbol=AAPL&periodLength=10&timeframe=1day

Parameters

Average Directional Index API
Globe Flag
Endpoint:

https://financialmodelingprep.com/stable/technical-indicators/adx?symbol=AAPL&periodLength=10&timeframe=1day

Parameters

Quote
Stock Quote API
Globe Flag
Access real-time stock quotes with the FMP Stock Quote API. Get up-to-the-minute prices, changes, and volume data for individual stocks.

Endpoint:

https://financialmodelingprep.com/stable/quote?symbol=AAPL

Parameters

Stock Quote Short API
Globe Flag
Get quick snapshots of real-time stock quotes with the FMP Stock Quote Short API. Access key stock data like current price, volume, and price changes for instant market insights.

Endpoint:

https://financialmodelingprep.com/stable/quote-short?symbol=AAPL

Parameters

Aftermarket Trade API
USA Flag
Track real-time trading activity occurring after regular market hours with the FMP Aftermarket Trade API. Access key details such as trade prices, sizes, and timestamps for trades executed during the post-market session.

Endpoint:

https://financialmodelingprep.com/stable/aftermarket-trade?symbol=AAPL

Parameters

Aftermarket Quote API
USA Flag
Access real-time aftermarket quotes for stocks with the FMP Aftermarket Quote API. Track bid and ask prices, volume, and other relevant data outside of regular trading hours.

Endpoint:

https://financialmodelingprep.com/stable/aftermarket-quote?symbol=AAPL

Parameters

Stock Price Change API
Globe Flag
Track stock price fluctuations in real-time with the FMP Stock Price Change API. Monitor percentage and value changes over various time periods, including daily, weekly, monthly, and long-term.

Endpoint:

https://financialmodelingprep.com/stable/stock-price-change?symbol=AAPL

Parameters

Stock Batch Quote API
Globe Flag
Retrieve multiple real-time stock quotes in a single request with the FMP Stock Batch Quote API. Access current prices, volume, and detailed data for multiple companies at once, making it easier to track large portfolios or monitor multiple stocks simultaneously.

Endpoint:

https://financialmodelingprep.com/stable/batch-quote?symbols=AAPL

Parameters

Stock Batch Quote Short API
Globe Flag
Access real-time, short-form quotes for multiple stocks with the FMP Stock Batch Quote Short API. Get a quick snapshot of key stock data such as current price, change, and volume for several companies in one streamlined request.

Endpoint:

https://financialmodelingprep.com/stable/batch-quote-short?symbols=AAPL

Parameters

Batch Aftermarket Trade API
USA Flag
Retrieve real-time aftermarket trading data for multiple stocks with the FMP Batch Aftermarket Trade API. Track post-market trade prices, volumes, and timestamps across several companies simultaneously.

Endpoint:

https://financialmodelingprep.com/stable/batch-aftermarket-trade?symbols=AAPL

Parameters

Batch Aftermarket Quote API
USA Flag
Retrieve real-time aftermarket quotes for multiple stocks with the FMP Batch Aftermarket Quote API. Access bid and ask prices, volume, and other relevant data for several companies during post-market trading.

Endpoint:

https://financialmodelingprep.com/stable/batch-aftermarket-quote?symbols=AAPL

Parameters

Exchange Stock Quotes API
Globe Flag
Retrieve real-time stock quotes for all listed stocks on a specific exchange with the FMP Exchange Stock Quotes API. Track price changes and trading activity across the entire exchange.

Endpoint:

https://financialmodelingprep.com/stable/batch-exchange-quote?exchange=NASDAQ

Parameters

Mutual Fund Price Quotes API
USA Flag
Access real-time quotes for mutual funds with the FMP Mutual Fund Price Quotes API. Track current prices, performance changes, and key data for various mutual funds.

Endpoint:

https://financialmodelingprep.com/stable/batch-mutualfund-quotes

Parameters

ETF Price Quotes API
Globe Flag
Get real-time price quotes for exchange-traded funds (ETFs) with the FMP ETF Price Quotes API. Track current prices, performance changes, and key data for a wide variety of ETFs.

Endpoint:

https://financialmodelingprep.com/stable/batch-etf-quotes

Parameters

Full Commodities Quotes API
Get up-to-the-minute quotes for commodities with the FMP Real-Time Commodities Quotes API. Track the latest prices, changes, and volumes for a wide range of commodities, including oil, gold, and agricultural products.

Endpoint:

https://financialmodelingprep.com/stable/batch-commodity-quotes

Parameters

Full Cryptocurrency Quotes API
Access real-time cryptocurrency quotes with the FMP Full Cryptocurrency Quotes API. Track live prices, trading volumes, and price changes for a wide range of digital assets.

Endpoint:

https://financialmodelingprep.com/stable/batch-crypto-quotes

Parameters

Full Forex Quote API
Retrieve real-time quotes for multiple forex currency pairs with the FMP Batch Forex Quote API. Get real-time price changes and updates for a variety of forex pairs in a single request.

Endpoint:

https://financialmodelingprep.com/stable/batch-forex-quotes

Parameters

Full Index Quotes API
Track real-time movements of major stock market indexes with the FMP Stock Market Index Quotes API. Access live quotes for global indexes and monitor changes in their performance.

Endpoint:

https://financialmodelingprep.com/stable/batch-index-quotes

Parameters

Earnings Transcript
Latest Earning Transcripts API
Globe Flag
Access available earnings transcripts for companies with the FMP Latest Earning Transcripts API. Retrieve a list of companies with earnings transcripts, along with the total number of transcripts available for each company.

Endpoint:

https://financialmodelingprep.com/stable/earning-call-transcript-latest

Parameters

Earnings Transcript API
Globe Flag
Access the full transcript of a company’s earnings call with the FMP Earnings Transcript API. Stay informed about a company’s financial performance, future plans, and overall strategy by analyzing management's communication.

Endpoint:

https://financialmodelingprep.com/stable/earning-call-transcript?symbol=AAPL&year=2020&quarter=3

Parameters

Transcripts Dates By Symbol API
Globe Flag
Access earnings call transcript dates for specific companies with the FMP Transcripts Dates By Symbol API. Get a comprehensive overview of earnings call schedules based on fiscal year and quarter.

Endpoint:

https://financialmodelingprep.com/stable/earning-call-transcript-dates?symbol=AAPL

Parameters

Available Transcript Symbols API
Globe Flag
Access a complete list of stock symbols with available earnings call transcripts using the FMP Available Earnings Transcript Symbols API. Retrieve information on which companies have earnings transcripts and how many are accessible for detailed financial analysis.

Endpoint:

https://financialmodelingprep.com/stable/earnings-transcript-list

Sec Filings
Latest 8-K SEC Filings API
USA Flag
Stay up-to-date with the most recent 8-K filings from publicly traded companies using the FMP Latest 8-K SEC Filings API. Get real-time access to significant company events such as mergers, acquisitions, leadership changes, and other material events that may impact the market.

Endpoint:

https://financialmodelingprep.com/stable/sec-filings-8k?from=2024-01-01&to=2024-03-01&page=0&limit=100

Parameters

Latest SEC Filings API
USA Flag
Stay updated with the most recent SEC filings from publicly traded companies using the FMP Latest SEC Filings API. Access essential regulatory documents, including financial statements, annual reports, 8-K, 10-K, and 10-Q forms.

Endpoint:

https://financialmodelingprep.com/stable/sec-filings-financials?from=2024-01-01&to=2024-03-01&page=0&limit=100

Parameters

SEC Filings By Form Type API
USA Flag
Search for specific SEC filings by form type with the FMP SEC Filings By Form Type API. Retrieve filings such as 10-K, 10-Q, 8-K, and others, filtered by the exact type of document you're looking for.

Endpoint:

https://financialmodelingprep.com/stable/sec-filings-search/form-type?formType=8-K&from=2024-01-01&to=2024-03-01&page=0&limit=100

Parameters

SEC Filings By Symbol API
USA Flag
Search and retrieve SEC filings by company symbol using the FMP SEC Filings By Symbol API. Gain direct access to regulatory filings such as 8-K, 10-K, and 10-Q reports for publicly traded companies.

Endpoint:

https://financialmodelingprep.com/stable/sec-filings-search/symbol?symbol=AAPL&from=2024-01-01&to=2024-03-01&page=0&limit=100

Parameters

SEC Filings By CIK API
USA Flag
Search for SEC filings using the FMP SEC Filings By CIK API. Access detailed regulatory filings by Central Index Key (CIK) number, enabling you to track all filings related to a specific company or entity.

Endpoint:

https://financialmodelingprep.com/stable/sec-filings-search/cik?cik=0000320193&from=2024-01-01&to=2024-03-01&page=0&limit=100

Parameters

SEC Filings By Name API
USA Flag
Search for SEC filings by company or entity name using the FMP SEC Filings By Name API. Quickly retrieve official filings for any organization based on its name.

Endpoint:

https://financialmodelingprep.com/stable/sec-filings-company-search/name?company=Berkshire

Parameters

SEC Filings Company Search By Symbol API
USA Flag
Find company information and regulatory filings using a stock symbol with the FMP SEC Filings Company Search By Symbol API. Quickly access essential company details based on stock ticker symbols.

Endpoint:

https://financialmodelingprep.com/stable/sec-filings-company-search/symbol?symbol=AAPL

Parameters

SEC Filings Company Search By CIK API
USA Flag
Easily find company information using a CIK (Central Index Key) with the FMP SEC Filings Company Search By CIK API. Access essential company details and filings linked to a specific CIK number.

Endpoint:

https://financialmodelingprep.com/stable/sec-filings-company-search/cik?cik=0000320193

Parameters

SEC Company Full Profile API
USA Flag
Retrieve detailed company profiles, including business descriptions, executive details, contact information, and financial data with the FMP SEC Company Full Profile API.

Endpoint:

https://financialmodelingprep.com/stable/sec-profile?symbol=AAPL

Parameters

Industry Classification List API
USA Flag
Retrieve a comprehensive list of industry classifications, including Standard Industrial Classification (SIC) codes and industry titles with the FMP Industry Classification List API.

Endpoint:

https://financialmodelingprep.com/stable/standard-industrial-classification-list

Parameters

Industry Classification Search API
USA Flag
Search and retrieve industry classification details for companies, including SIC codes, industry titles, and business information, with the FMP Industry Classification Search API.

Endpoint:

https://financialmodelingprep.com/stable/industry-classification-search

Parameters

All Industry Classification API
USA Flag
Access comprehensive industry classification data for companies across all sectors with the FMP All Industry Classification API. Retrieve key details such as SIC codes, industry titles, and business contact information.

Endpoint:

https://financialmodelingprep.com/stable/all-industry-classification

Parameters

Senate
Latest Senate Financial Disclosures API
USA Flag
Access the latest financial disclosures from U.S. Senate members with the FMP Latest Senate Financial Disclosures API. Track recent trades, asset ownership, and transaction details for enhanced transparency in government financial activities.

Endpoint:

https://financialmodelingprep.com/stable/senate-latest?page=0&limit=100

Parameters

Latest House Financial Disclosures API
USA Flag
Access real-time financial disclosures from U.S. House members with the FMP Latest House Financial Disclosures API. Track recent trades, asset ownership, and financial holdings for enhanced visibility into political figures' financial activities.

Endpoint:

https://financialmodelingprep.com/stable/house-latest?page=0&limit=100

Parameters

Senate Trading Activity API
USA Flag
Monitor the trading activity of US Senators with the FMP Senate Trading Activity API. Access detailed information on trades made by Senators, including trade dates, assets, amounts, and potential conflicts of interest.

Endpoint:

https://financialmodelingprep.com/stable/senate-trades?symbol=AAPL

Parameters

Senate Trades By Name API
USA Flag
Endpoint:

https://financialmodelingprep.com/stable/senate-trades-by-name?name=Jerry

Parameters

U.S. House Trades API
USA Flag
Track the financial trades made by U.S. House members and their families with the FMP U.S. House Trades API. Access real-time information on stock sales, purchases, and other investment activities to gain insight into their financial decisions.

Endpoint:

https://financialmodelingprep.com/stable/house-trades?symbol=AAPL

Parameters

House Trades By Name API
USA Flag
Endpoint:

https://financialmodelingprep.com/stable/house-trades-by-name?name=James

Parameters

Bulk
Company Profile Bulk API
Globe Flag
The FMP Profile Bulk API allows users to retrieve comprehensive company profile data in bulk. Access essential information, such as company details, stock price, market cap, sector, industry, and more for multiple companies in a single request.

Endpoint:

https://financialmodelingprep.com/stable/profile-bulk?part=0

Parameters

Stock Rating Bulk API
Globe Flag
The FMP Rating Bulk API provides users with comprehensive rating data for multiple stocks in a single request. Retrieve key financial ratings and recommendations such as overall ratings, DCF recommendations, and more for multiple companies at once.

Endpoint:

https://financialmodelingprep.com/stable/rating-bulk

DCF Valuations Bulk API
Globe Flag
The FMP DCF Bulk API enables users to quickly retrieve discounted cash flow (DCF) valuations for multiple symbols in one request. Access the implied price movement and percentage differences for all listed companies.

Endpoint:

https://financialmodelingprep.com/stable/dcf-bulk

Financial Scores Bulk API
Globe Flag
The FMP Scores Bulk API allows users to quickly retrieve a wide range of key financial scores and metrics for multiple symbols. These scores provide valuable insights into company performance, financial health, and operational efficiency.

Endpoint:

https://financialmodelingprep.com/stable/scores-bulk

Price Target Summary Bulk API
Globe Flag
The Price Target Summary Bulk API provides a comprehensive overview of price targets for all listed symbols over multiple timeframes. With this API, users can quickly retrieve price target data, helping investors and analysts compare current prices to projected targets across different periods.

Endpoint:

https://financialmodelingprep.com/stable/price-target-summary-bulk

ETF Holder Bulk API
Globe Flag
The ETF Holder Bulk API allows users to quickly retrieve detailed information about the assets and shares held by Exchange-Traded Funds (ETFs). This API provides insights into the weight each asset carries within the ETF, along with key financial information related to these holdings.

Endpoint:

https://financialmodelingprep.com/stable/etf-holder-bulk?part=1

Parameters

Upgrades Downgrades Consensus Bulk API
Globe Flag
The Upgrades Downgrades Consensus Bulk API provides a comprehensive view of analyst ratings across all symbols. Retrieve bulk data for analyst upgrades, downgrades, and consensus recommendations to gain insights into the market's outlook on individual stocks.

Endpoint:

https://financialmodelingprep.com/stable/upgrades-downgrades-consensus-bulk

Key Metrics TTM Bulk API
Globe Flag
The Key Metrics TTM Bulk API allows users to retrieve trailing twelve months (TTM) data for all companies available in the database. The API provides critical financial ratios and metrics based on each company’s latest financial report, offering insights into company performance and financial health.

Endpoint:

https://financialmodelingprep.com/stable/key-metrics-ttm-bulk

Ratios TTM Bulk API
Globe Flag
The Ratios TTM Bulk API offers an efficient way to retrieve trailing twelve months (TTM) financial ratios for stocks. It provides users with detailed insights into a company’s profitability, liquidity, efficiency, leverage, and valuation ratios, all based on the most recent financial report.

Endpoint:

https://financialmodelingprep.com/stable/ratios-ttm-bulk

Stock Peers Bulk API
Globe Flag
The Stock Peers Bulk API allows you to quickly retrieve a comprehensive list of peer companies for all stocks in the database. By accessing this data, you can easily compare a stock’s performance with its closest competitors or similar companies within the same industry or sector.

Endpoint:

https://financialmodelingprep.com/stable/peers-bulk

Earnings Surprises Bulk API
Globe Flag
The Earnings Surprises Bulk API allows users to retrieve bulk data on annual earnings surprises, enabling quick analysis of which companies have beaten, missed, or met their earnings estimates. This API provides actual versus estimated earnings per share (EPS) for multiple companies at once, offering valuable insights for investors and analysts.

Endpoint:

https://financialmodelingprep.com/stable/earnings-surprises-bulk?year=2025

Parameters

Income Statement Bulk API
Globe Flag
The Bulk Income Statement API allows users to retrieve detailed income statement data in bulk. This API is designed for large-scale data analysis, providing comprehensive insights into a company's financial performance, including revenue, gross profit, expenses, and net income.

Endpoint:

https://financialmodelingprep.com/stable/income-statement-bulk?year=2025&period=Q1

Parameters

Income Statement Growth Bulk API
Globe Flag
The Bulk Income Statement Growth API provides access to growth data for income statements across multiple companies. Track and analyze growth trends over time for key financial metrics such as revenue, net income, and operating income, enabling a better understanding of corporate performance trends.

Endpoint:

https://financialmodelingprep.com/stable/income-statement-growth-bulk?year=2025&period=Q1

Parameters

Balance Sheet Statement Bulk API
Globe Flag
The Bulk Balance Sheet Statement API provides comprehensive access to balance sheet data across multiple companies. It enables users to analyze financial positions by retrieving key figures such as total assets, liabilities, and equity. Ideal for comparing the financial health and stability of different companies on a large scale.

Endpoint:

https://financialmodelingprep.com/stable/balance-sheet-statement-bulk?year=2025&period=Q1

Parameters

Balance Sheet Statement Growth Bulk API
Globe Flag
The Balance Sheet Growth Bulk API allows users to retrieve growth data across multiple companies’ balance sheets, enabling detailed analysis of how financial positions have changed over time.

Endpoint:

https://financialmodelingprep.com/stable/balance-sheet-statement-growth-bulk?year=2025&period=Q1

Parameters

Cash Flow Statement Bulk API
Globe Flag
The Cash Flow Statement Bulk API provides access to detailed cash flow reports for a wide range of companies. This API enables users to retrieve bulk cash flow statement data, helping to analyze companies’ operating, investing, and financing activities over time.

Endpoint:

https://financialmodelingprep.com/stable/cash-flow-statement-bulk?year=2025&period=Q1

Parameters

Cash Flow Statement Growth Bulk API
Globe Flag
The Cash Flow Statement Growth Bulk API allows you to retrieve bulk growth data for cash flow statements, enabling you to track changes in cash flows over time. This API is ideal for analyzing the cash flow growth trends of multiple companies simultaneously.

Endpoint:

https://financialmodelingprep.com/stable/cash-flow-statement-growth-bulk?year=2025&period=Q1

Parameters

Eod Bulk API
Globe Flag
The EOD Bulk API allows users to retrieve end-of-day stock price data for multiple symbols in bulk. This API is ideal for financial analysts, traders, and investors who need to assess valuations for a large number of companies.

Endpoint:

https://financialmodelingprep.com/stable/eod-bulk?date=2024-10-22

Parameters

