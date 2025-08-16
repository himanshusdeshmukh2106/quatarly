from Fundamentals import MoneyControl
mc = MoneyControl()
Searching a ticker aka 'sid' in Moneycontrol
res, raw = mc.get_ticker('Vinati org')
res, raw[0]
('VO01',
 {'link_src': 'https://www.moneycontrol.com/india/stockpricequote/chemicals/vinatiorganics/VO01',
  'link_track': 'http://arjun.in.com/dashboard/api/profilingSuggestions.php?id=VO01&type=stock',
  'pdt_dis_nm': 'Vinati Organics&nbsp;<span>INE410B01037, VINATIORGA, 524200</span>',
  'name': 'Vinati Organics',
  'sc_id': 'VO01',
  'stock_name': 'Vinati Organics',
  'sc_sector_id': 'CH',
  'sc_sector': 'Chemicals',
  'forum_topics_url': 'https://mmb.moneycontrol.com/forum-topics/stocks/vinati-organics-37481.html'})
Bharat (India) VIX
mc.get_india_vix(interval='1') # Interval can take '1' or '1d' only
t	o	h	l	c	v
0	1746685080	18.37	18.39	18.36	18.39	0
1	1746685140	18.39	18.39	18.35	18.36	0
2	1746685200	18.36	18.37	18.36	18.37	0
3	1746685260	18.37	18.37	18.36	18.37	0
4	1746685320	18.36	18.37	18.36	18.36	0
...	...	...	...	...	...	...
15778	1751868720	12.54	12.54	12.52	12.52	0
15779	1751868780	12.52	12.54	12.52	12.54	0
15780	1751868840	12.54	12.54	12.54	12.54	0
15781	1751868900	12.54	12.55	12.52	12.55	0
15782	1751868960	12.55	12.55	12.54	12.55	0
15783 rows × 6 columns

Mini statements (These are extracted from annual and quarterly results)
# Params
# statement_type = 'consolidated' (default) or 'standalone'
# statement_frequency = 3 or 12 (default)

# you can only get last 5 timeperiod data

mc.get_overview_mini_statement('RI', statement_type='consolidated', statement_frequency=3)
headings	Mar 2024	Jun 2024	Sep 2024	Dec 2024	Mar 2025
0	Revenue	236533.00	231784.00	231535.00	239986.00	261388.00
1	Net Profit	21143.00	17448.00	19101.00	21804.00	22434.00
2	EPS	28.01	22.37	24.48	13.70	14.34
mc.get_overview_mini_statement('HDF01', statement_type='standalone', statement_frequency=3)
headings	Mar 2024	Jun 2024	Sep 2024	Dec 2024	Mar 2025
0	Revenue	71472	73033	74016	76006	77460
1	Net Profit	16511	16174	16820	16735	17616
2	EPS	21.74	21.28	22.08	21.90	23.03
# Params
# statement_type = 'consolidated' (default) or 'standalone'
# statement_frequency = 3 or 6 or 9 or 12 (default)

# you can only get last <5 timeperiod data

mc.get_income_mini_statement('VO01', statement_type='consolidated', statement_frequency=9)
Nine Months	Dec 2024	Dec 2023	Dec 2022	Dec 2021
0	Sales	1599	1349	1581	1129
1	Other Income	38	29	55	45
2	Total Income	1637	1378	1636	1175
3	Total Expenditure	1265	1083	1177	867
4	EBIT	372	295	459	307
5	Interest	0	2	0	0
6	Tax	90	74	116	61
7	Net Profit	282	218	342	245
# Params
# statement_type = 'consolidated' (default) or 'standalone'

# you can only get last <5 timeperiod data

mc.get_balance_sheet_mini_statement('VO01', statement_type='standalone')
headers	Mar 2025	Mar 2024	Mar 2023	Mar 2022	Mar 2021
0	Share Capital	10	10	10	10	10
1	Reserves & Surplus	2796	2454	2208	1817	1533
2	Current Liabilities	295	204	219	167	106
3	Other Liabilities	161	157	108	94	83
4	Total Liabilities	3262	2826	2547	2089	1733
5	Fixed Assets	1680	1575	1103	920	811
6	Current Assets	968	968	989	775	654
7	Other Assets	613	282	454	393	267
8	Total Assets	3262	2826	2547	2089	1733
9	Contingent Liabilities	0	192	82	107	138
# Params
# statement_type = 'consolidated' (default) or 'standalone'

# you can only get last <5 timeperiod data

mc.get_cash_flow_mini_statement('IRF', statement_type='standalone')
Unnamed: 0	Mar 2025	Mar 2024	Mar 2023	Mar 2022	Mar 2021
0	Operating Activities	8229	7914	-28583	-64412	-89906
1	Investing Activities	0	-7	0	-4	0
2	Financing Activities	-2571	-8046	28643	64266	90202
3	Others	0	0	0	0	0
4	Net Cash Flow	5657	-139	59	-150	295
# Params
# statement_type = 'consolidated' (default) or 'standalone'

# you can only get last <5 timeperiod data

mc.get_ratios_mini_statement('IRC', statement_type='standalone')
ratios	Mar 2025	Mar 2024	Mar 2023	Mar 2022	Mar 2021
0	Basic EPS (Rs.)	16.43	13.89	12.57	8.30	11.87
1	Diluted Eps (Rs.)	16.43	13.89	12.57	8.30	11.87
2	Book Value [Excl. Reval Reserve]/Share (Rs.)	45.79	40.37	30.98	117.74	91.68
3	Dividend/Share (Rs.)	8.00	6.50	5.50	17.50	5.00
4	Face Value	2.00	2.00	2.00	10.00	10.00
5	Gross Profit Margin (%)	38.04	38.18	39.43	50.66	35.23
6	Operating Margin (%)	36.92	36.84	37.91	48.12	29.32
7	Net Profit Margin (%)	28.12	26.02	28.40	35.31	24.25
8	Return on Networth / Equity (%)	35.88	34.40	40.58	35.22	12.94
9	ROCE (%)	43.18	45.48	49.78	44.07	14.10
10	Return On Assets (%)	19.33	18.24	19.76	17.29	5.99
11	Current Ratio (X)	2.02	1.95	1.82	1.87	1.77
12	Quick Ratio (X)	2.01	1.95	1.82	1.86	1.77
13	Debt to Equity (x)	0.00	0.00	0.00	0.01	0.00
14	Interest Coverage Ratios (X)	105.29	87.46	86.68	86.18	33.86
15	Asset Turnover Ratio (%)	0.73	0.76	0.79	0.54	0.24
16	Inventory Turnover Ratio (X)	6.00	7.00	8.63	5.55	3.87
17	P/E (x)	44.28	66.93	45.57	93.34	29.60
18	P/B (x)	15.88	23.03	18.50	6.58	19.15
19	EV/EBITDA (x)	31.51	44.24	31.44	11.22	96.54
20	P/S (x)	12.44	17.42	12.94	6.59	35.88
Complete Statements Regarding financials of Equity
# Balance sheet
# Params
# company_mc_url = MoneyControl company url (you can get this from `get_ticker` function)
# statement_type = 'consolidated' (default) or 'standalone'
# num_years = 5 any int which is multiple of 5 (if not it will round off to nearest 5 multiples)

# you can only get last <5 timeperiod data
_, raw = mc.get_ticker('Deepak nitrate')
mc_profile_link = raw[0].get('link_src')
print(mc_profile_link)
mc.get_complete_balance_sheet(mc_profile_link, statement_type='standalone', num_years=10)
https://www.moneycontrol.com/india/stockpricequote/chemicals/deepaknitrite/DN
Balance Sheet of Deepak Nitrite (in Rs. Cr.)	Mar 25	Mar 24	Mar 23	Mar 22	Mar 21	Mar 20	Mar 19	Mar 18	Mar 17	Mar 16
0	NaN	12 mths	12 mths	12 mths	12 mths	12 mths	12 mths	12 mths	12 mths	12 mths	12 mths
1	EQUITIES AND LIABILITIES	NaN	NaN	NaN	NaN	NaN	NaN	NaN	NaN	NaN	NaN
2	SHAREHOLDER'S FUNDS	NaN	NaN	NaN	NaN	NaN	NaN	NaN	NaN	NaN	NaN
3	Equity Share Capital	27.28	27.28	27.28	27.28	27.28	27.28	27.28	27.28	26.14	23.26
4	Total Share Capital	27.28	27.28	27.28	27.28	27.28	27.28	27.28	27.28	26.14	23.26
...	...	...	...	...	...	...	...	...	...	...	...
60	Non-Current Investments Quoted Market Value	--	--	--	--	--	--	--	--	--	--
61	Non-Current Investments Unquoted Book Value	--	854.77	687.88	472.16	562.86	562.83	562.80	433.73	253.65	65.22
62	CURRENT INVESTMENTS	NaN	NaN	NaN	NaN	NaN	NaN	NaN	NaN	NaN	NaN
63	Current Investments Quoted Market Value	--	--	--	--	--	--	--	--	--	--
64	Current Investments Unquoted Book Value	--	--	--	--	--	--	--	--	--	--
65 rows × 11 columns

# P&L statements
# Params
# company_mc_url = MoneyControl company url (you can get this from `get_ticker` function)
# statement_type = 'consolidated' (default) or 'standalone'
# num_years = 5 is the default value any int which is multiple of 5 (if not it will round off to nearest 5 multiples)

# you can only get last <5 timeperiod data
_, raw = mc.get_ticker('sun pharma')
mc_profile_link = raw[0].get('link_src')
print(mc_profile_link)
mc.get_complete_profit_loss(mc_profile_link, statement_type='standalone', num_years=5)
https://www.moneycontrol.com/india/stockpricequote/pharmaceuticals/sunpharmaceuticalindustries/SPI
Profit & Loss account of Sun Pharmaceutical Industries (in Rs. Cr.)	Mar 25	Mar 24	Mar 23	Mar 22	Mar 21
1	NaN	12 mths	12 mths	12 mths	12 mths	12 mths
2	INCOME	NaN	NaN	NaN	NaN	NaN
3	Revenue From Operations [Gross]	22625.88	19843.53	20394.63	15518.50	12570.93
4	Less: Excise/Sevice Tax/Other Levies	0.00	0.00	0.00	0.00	0.00
5	Revenue From Operations [Net]	22625.88	19843.53	20394.63	15518.50	12570.93
6	Total Operating Revenues	23003.33	20275.17	20812.14	15585.98	12803.21
7	Other Income	369.43	465.76	279.03	957.92	150.22
8	Total Revenue	23372.76	20740.93	21091.17	16543.90	12953.43
9	EXPENSES	NaN	NaN	NaN	NaN	NaN
10	Cost Of Materials Consumed	4690.67	4429.38	5165.63	4584.97	3809.11
11	Purchase Of Stock-In Trade	1359.53	994.41	1126.46	1248.60	1199.63
12	Operating And Direct Expenses	0.00	344.45	313.75	275.23	0.00
13	Changes In Inventories Of FG,WIP And Stock-In ...	-69.17	180.32	-237.93	-183.18	-214.84
14	Employee Benefit Expenses	2608.26	2373.95	2156.95	2000.78	1798.45
15	Finance Costs	893.21	784.08	472.18	388.10	256.98
16	Depreciation And Amortisation Expenses	1238.27	1600.62	1600.87	1349.95	586.81
17	Other Expenses	7621.42	6365.05	5814.42	4752.06	3274.86
18	Total Expenses	18342.19	17072.26	16412.33	14416.51	10711.00
19	Profit/Loss Before Exceptional, ExtraOrdinary ...	5030.57	3668.67	4678.84	2127.39	2242.43
20	Exceptional Items	0.00	-219.02	-2937.79	-1820.53	-89.56
21	Profit/Loss Before Tax	5030.57	3449.65	1741.05	306.86	2152.87
22	Tax Expenses-Continued Operations	NaN	NaN	NaN	NaN	NaN
23	Current Tax	747.95	546.10	752.77	-553.58	244.91
24	Less: MAT Credit Entitlement	0.00	0.00	0.00	0.00	0.00
25	Deferred Tax	0.00	45.37	-702.44	960.43	-231.74
26	Tax For Earlier Years	0.00	0.00	0.00	0.00	0.00
27	Total Tax Expenses	747.95	591.47	50.33	406.85	13.17
28	Profit/Loss After Tax And Before ExtraOrdinary...	4282.62	2858.18	1690.72	-99.99	2139.70
29	Profit/Loss From Continuing Operations	4282.62	2858.18	1690.72	-99.99	2139.70
30	Profit/Loss For The Period	4282.62	2858.18	1690.72	-99.99	2139.70
31	OTHER ADDITIONAL INFORMATION	NaN	NaN	NaN	NaN	NaN
32	EARNINGS PER SHARE	NaN	NaN	NaN	NaN	NaN
33	Basic EPS (Rs.)	17.80	11.90	7.00	-0.40	8.92
34	Diluted EPS (Rs.)	17.80	11.90	7.00	-0.40	8.92
35	VALUE OF IMPORTED AND INDIGENIOUS RAW MATERIAL...	NaN	NaN	NaN	NaN	NaN
36	Imported Raw Materials	0.00	0.00	0.00	0.00	0.00
37	Indigenous Raw Materials	0.00	0.00	0.00	0.00	0.00
38	STORES, SPARES AND LOOSE TOOLS	NaN	NaN	NaN	NaN	NaN
39	Imported Stores And Spares	0.00	0.00	0.00	0.00	0.00
40	Indigenous Stores And Spares	0.00	0.00	0.00	0.00	0.00
41	DIVIDEND AND DIVIDEND PERCENTAGE	NaN	NaN	NaN	NaN	NaN
42	Equity Share Dividend	0.00	2898.16	2519.30	2158.91	1559.06
43	Tax On Dividend	0.00	0.00	0.00	0.00	0.00
44	Equity Dividend Rate (%)	1600.00	1350.00	1150.00	1000.00	750.00
# Complete Quarterly results
# Params
# company_mc_url = MoneyControl company url (you can get this from `get_ticker` function)
# statement_type = 'consolidated' (default) or 'standalone'
# num_quarters = 5 is the default value any int which is multiple of 5 (if not it will round off to nearest 5 multiples)

# you can only get last <5 timeperiod data
_, raw = mc.get_ticker('cipla')
mc_profile_link = raw[0].get('link_src')
print(mc_profile_link)
mc.get_complete_quarterly_results(mc_profile_link, statement_type='standalone', num_quarters=5)
https://www.moneycontrol.com/india/stockpricequote/pharmaceuticals/cipla/C
Quarterly Results of Cipla (in Rs. Cr.)	Mar '25	Dec '24	Sep '24	Jun '24	Mar '24
1	Net Sales/Income from operations	4254.47	4134.87	3969.86	3752.25	3444.92
2	Other Operating Income	543.42	836.01	805.17	748.80	591.74
3	Total Income From Operations	4797.89	4970.88	4775.03	4501.05	4036.66
4	EXPENDITURE	NaN	NaN	NaN	NaN	NaN
5	Consumption of Raw Materials	923.60	940.73	974.92	803.59	517.24
6	Purchase of Traded Goods	464.76	475.64	544.27	572.08	467.43
7	Increase/Decrease in Stocks	-6.75	-44.56	-100.45	-78.11	176.94
8	Power & Fuel	--	--	--	--	--
9	Employees Cost	784.93	761.45	744.58	763.91	662.15
10	depreciat	147.70	142.62	145.71	137.86	136.81
11	Excise Duty	--	--	--	--	--
12	Admin. And Selling Expenses	--	--	--	--	--
13	R & D Expenses	--	--	--	--	--
14	Provisions And Contingencies	--	--	--	--	--
15	Exp. Capitalised	--	--	--	--	--
16	Other Expenses	1312.64	1175.79	1173.67	1079.72	1385.01
17	P/L Before Other Inc. , Int., Excpt. Items & Tax	1171.01	1519.21	1292.33	1222.00	691.08
18	Other Income	293.37	188.69	289.14	213.52	538.61
19	P/L Before Int., Excpt. Items & Tax	1464.38	1707.90	1581.47	1435.52	1229.69
20	Interest	3.49	3.55	3.00	5.07	5.45
21	P/L Before Exceptional Items & Tax	1460.89	1704.35	1578.47	1430.45	1224.24
22	Exceptional Items	294.66	--	--	--	--
23	P/L Before Tax	1755.55	1704.35	1578.47	1430.45	1224.24
24	Tax	270.15	266.20	400.31	374.51	242.21
25	P/L After Tax from Ordinary Activities	1485.40	1438.15	1178.16	1055.94	982.03
26	Prior Year Adjustments	--	--	--	--	--
27	Extra Ordinary Items	--	--	--	--	56.37
28	Net Profit/(Loss) For the Period	1485.40	1438.15	1178.16	1055.94	1038.40
29	Equity Share Capital	161.52	161.52	161.51	161.50	161.47
30	Reserves Excluding Revaluation Reserves	--	--	--	--	--
31	Equity Dividend Rate (%)	--	--	--	--	--
32	EPS Before Extra Ordinary	NaN	NaN	NaN	NaN	NaN
33	Basic EPS	18.39	17.81	14.59	13.08	12.86
34	Diluted EPS	18.38	17.79	14.58	13.07	12.85
35	EPS After Extra Ordinary	NaN	NaN	NaN	NaN	NaN
36	Basic EPS.	18.39	17.81	14.59	13.08	12.86
37	Diluted EPS.	18.38	17.79	14.58	13.07	12.85
38	Public Share Holding	NaN	NaN	NaN	NaN	NaN
39	No Of Shares (Crores)	--	--	--	--	--
40	Share Holding (%)	--	--	--	--	--
41	Promoters and Promoter Group Shareholding	NaN	NaN	NaN	NaN	NaN
42	a) Pledged/Encumbered	NaN	NaN	NaN	NaN	NaN
43	- Number of shares (Crores)	--	--	--	--	--
44	- Per. of shares (as a % of the total sh. of p...	--	--	--	--	--
45	- Per. of shares (as a % of the total Share Ca...	--	--	--	--	--
46	b) Non-encumbered	NaN	NaN	NaN	NaN	NaN
47	- Number of shares (Crores).	--	--	--	--	--
48	- Per. of shares (as a % of the total sh. of p...	--	--	--	--	--
49	- Per. of shares (as a % of the total Share Ca...	--	--	--	--	--
# Complete half-yearly results
# Params
# company_mc_url = MoneyControl company url (you can get this from `get_ticker` function)
# statement_type = 'consolidated' (default) or 'standalone'
# num_half_years = 5 is the default value any int which is multiple of 5 (if not it will round off to nearest 5 multiples)

# you can only get last <5 timeperiod data
_, raw = mc.get_ticker('ashok leyland')
mc_profile_link = raw[0].get('link_src')
print(mc_profile_link)
mc.get_complete_half_yearly_results(mc_profile_link, statement_type='standalone', num_half_years=5)
https://www.moneycontrol.com/india/stockpricequote/auto-lcvshcvs/ashokleyland/AL
Half Yearly Results of Ashok Leyland (in Rs. Cr.)	Mar '25	Sep '24	Mar '24	Sep '23	Mar '23
1	Net Sales/Income from operations	21293.65	17289.20	20450.18	17827.33	20655.34
2	Other Operating Income	91.73	78.16	89.52	--	--
3	Total Income From Operations	21385.38	17367.36	20539.70	17827.33	20655.34
4	EXPENDITURE	NaN	NaN	NaN	NaN	NaN
5	Consumption of Raw Materials	13739.40	11972.34	14047.84	12868.70	15283.56
6	Purchase of Traded Goods	856.77	823.69	793.01	713.40	627.89
7	Increase/Decrease in Stocks	580.93	-350.35	-52.54	-458.40	-236.93
8	Power & Fuel	--	--	--	--	--
9	Employees Cost	1257.84	1148.43	1122.99	1110.39	1141.40
10	Depreciation	371.18	348.16	358.16	359.65	372.77
11	Excise Duty	--	--	--	--	--
12	Admin. And Selling Expenses	--	--	--	--	--
13	R & D Expenses	--	--	--	--	--
14	Provisions And Contingencies	--	--	--	--	--
15	Exp. Capitalised	--	--	--	--	--
16	Other Expenses	1948.05	1845.08	1922.36	1692.70	1766.34
17	P/L Before Other	2631.21	1580.01	2347.88	1540.89	1700.31
18	Other Income	130.64	119.61	147.93	98.64	70.51
19	P/L Before Int.	2761.85	1699.62	2495.81	1639.53	1770.82
20	Interest	97.18	119.73	120.86	128.58	143.16
21	P/L Before Exceptional Items & Tax	2664.67	1579.89	2374.95	1510.95	1627.66
22	Exceptional Items	-13.65	117.38	-70.25	-23.47	63.37
23	P/L Before Tax	2651.02	1697.27	2304.70	1487.48	1691.03
24	Tax	643.41	401.59	824.26	350.05	578.28
25	P/L After Tax from Ordinary Activities	2007.61	1295.68	1480.44	1137.43	1112.75
26	Prior Year Adjustments	--	--	--	--	--
27	Extra Ordinary Items	--	--	--	--	--
28	Net Profit/(Loss) For the Period	2007.61	1295.68	1480.44	1137.43	1112.75
29	Equity Share Capital	293.65	293.64	293.63	293.61	293.61
30	Reserves Excluding Revaluation Reserves	11225.14	--	--	--	--
31	Equity Dividend Rate (%)	--	--	--	--	--
32	EPS Before Extra Ordinary	NaN	NaN	NaN	NaN	NaN
33	Basic EPS	6.84	4.41	5.04	3.87	3.79
34	Diluted EPS	--	4.40	--	3.87	--
35	EPS After Extra Ordinary	NaN	NaN	NaN	NaN	NaN
36	Basic EPS.	6.84	4.41	5.04	3.87	3.79
37	Diluted EPS.	--	4.40	--	3.87	--
38	Public Share Holding	NaN	NaN	NaN	NaN	NaN
39	No Of Shares (Crores)	--	--	--	--	--
40	Share Holding (%)	--	--	--	--	--
41	Promoters and Promoter Group Shareholding	NaN	NaN	NaN	NaN	NaN
42	a) Pledged/Encumbered	NaN	NaN	NaN	NaN	NaN
43	- Number of shares (Crores)	--	--	--	--	--
44	- Per. of shares (as a % of the total sh. of p...	--	--	--	--	--
45	- Per. of shares (as a % of the total Share Ca...	--	--	--	--	--
46	b) Non-encumbered	NaN	NaN	NaN	NaN	NaN
47	- Number of shares (Crores).	--	--	--	--	--
48	- Per. of shares (as a % of the total sh. of p...	--	--	--	--	--
49	- Per. of shares (as a % of the total Share Ca...	--	--	--	--	--
# Complete half-yearly results
# Params
# company_mc_url = MoneyControl company url (you can get this from `get_ticker` function)
# statement_type = 'consolidated' (default) or 'standalone'
# num_nine_months = 5 is the default value any int which is multiple of 5 (if not it will round off to nearest 5 multiples)

# you can only get last <5 timeperiod data
_, raw = mc.get_ticker('titan')
mc_profile_link = raw[0].get('link_src')
print(mc_profile_link)
mc.get_complete_nine_months_results(mc_profile_link, statement_type='standalone', num_nine_months=5)
https://www.moneycontrol.com/india/stockpricequote/miscellaneous/titancompany/TI01
Nine Months Results of Titan Company (in Rs. Cr.)	Dec '24	Dec '23	Dec '22	Dec '21	Dec '20
1	Net Sales/Income from operations	39426.00	32918.00	27071.00	19082.00	12055.00
2	Other Operating Income	1939.00	2939.00	1495.00	852.00	1412.00
3	Total Income From Operations	41365.00	35857.00	28566.00	19934.00	13467.00
4	EXPENDITURE	NaN	NaN	NaN	NaN	NaN
5	Consumption of Raw Materials	30685.00	24892.00	17471.00	14084.00	8636.00
6	Purchase of Traded Goods	4730.00	4251.00	4246.00	2828.00	1594.00
7	Increase/Decrease in Stocks	-2230.00	-1072.00	-154.00	-1757.00	-72.00
8	Power & Fuel	--	--	--	--	--
9	Employees Cost	1270.00	1128.00	991.00	815.00	660.00
10	Depreciation	393.00	327.00	269.00	259.00	249.00
11	Excise Duty	--	--	--	--	--
12	Admin. And Selling Expenses	732.00	648.00	547.00	318.00	153.00
13	R & D Expenses	--	--	--	--	--
14	Provisions And Contingencies	--	--	--	--	--
15	Exp. Capitalised	--	--	--	--	--
16	Other Expenses	2324.00	2095.00	1738.00	1149.00	1590.00
17	P/L Before Other Inc. , Int., Excpt. Items & Tax	3461.00	3588.00	3458.00	2238.00	657.00
18	Other Income	376.00	360.00	195.00	170.00	147.00
19	P/L Before Int., Excpt. Items & Tax	3837.00	3948.00	3653.00	2408.00	804.00
20	Interest	563.00	318.00	166.00	141.00	136.00
21	P/L Before Exceptional Items & Tax	3274.00	3630.00	3487.00	2267.00	668.00
22	Exceptional Items	--	--	--	--	-137.00
23	P/L Before Tax	3274.00	3630.00	3487.00	2267.00	531.00
24	Tax	809.00	872.00	887.00	578.00	183.00
25	P/L After Tax from Ordinary Activities	2465.00	2758.00	2600.00	1689.00	348.00
26	Prior Year Adjustments	--	--	--	--	--
27	Extra Ordinary Items	--	--	--	--	--
28	Net Profit/(Loss) For the Period	2465.00	2758.00	2600.00	1689.00	348.00
29	Equity Share Capital	89.00	89.00	89.00	89.00	89.00
30	Reserves Excluding Revaluation Reserves	--	--	--	--	--
31	Equity Dividend Rate (%)	--	--	--	--	--
32	EPS Before Extra Ordinary	NaN	NaN	NaN	NaN	NaN
33	Basic EPS	27.79	31.07	29.29	19.02	3.92
34	Diluted EPS	27.78	31.06	29.29	19.02	3.92
35	EPS After Extra Ordinary	NaN	NaN	NaN	NaN	NaN
36	Basic EPS.	27.79	31.07	29.29	19.02	3.92
37	Diluted EPS.	27.78	31.06	29.29	19.02	3.92
38	Public Share Holding	NaN	NaN	NaN	NaN	NaN
39	No Of Shares (Crores)	--	--	--	--	--
40	Share Holding (%)	--	--	--	--	--
41	Promoters and Promoter Group Shareholding	NaN	NaN	NaN	NaN	NaN
42	a) Pledged/Encumbered	NaN	NaN	NaN	NaN	NaN
43	- Number of shares (Crores)	--	--	--	--	--
44	- Per. of shares (as a % of the total sh. of p...	--	--	--	--	--
45	- Per. of shares (as a % of the total Share Ca...	--	--	--	--	--
46	b) Non-encumbered	NaN	NaN	NaN	NaN	NaN
47	- Number of shares (Crores)	--	--	--	--	--
48	- Per. of shares (as a % of the total sh. of p...	--	--	--	--	--
49	- Per. of shares (as a % of the total Share Ca...	--	--	--	--	--
# Complete Annual results
# Params
# company_mc_url = MoneyControl company url (you can get this from `get_ticker` function)
# statement_type = 'consolidated' (default) or 'standalone'
# num_years = 5 is the default value any int which is multiple of 5 (if not it will round off to nearest 5 multiples)

# you can only get last <5 timeperiod data
_, raw = mc.get_ticker('tata power')
mc_profile_link = raw[0].get('link_src')
print(mc_profile_link)
mc.get_complete_yearly_results(mc_profile_link, statement_type='standalone', num_years=5)
https://www.moneycontrol.com/india/stockpricequote/power-generationdistribution/thetatapowercompany/TPC
Yearly Results of The Tata Power Company (in Rs. Cr.)	Mar '25	Mar '24	Mar '23	Mar '22	Mar '21
1	Net Sales/Income from operations	22359.44	20093.36	17727.78	11107.93	6180.59
2	Other Operating Income	--	--	--	--	--
3	Total Income From Operations	22359.44	20093.36	17727.78	11107.93	6180.59
4	EXPENDITURE	NaN	NaN	NaN	NaN	NaN
5	Consumption of Raw Materials	--	--	--	--	--
6	Purchase of Traded Goods	--	--	--	--	--
7	Increase/Decrease in Stocks	--	--	--	--	--
8	Power & Fuel	--	--	--	7366.64	2690.68
9	Employees Cost	789.82	794.71	746.17	737.59	649.07
10	Depreciation	1193.88	1188.46	1167.47	1134.23	668.89
11	Excise Duty	--	--	--	--	--
12	Admin. And Selling Expenses	--	--	--	--	--
13	R & D Expenses	--	--	--	--	--
14	Provisions And Contingencies	--	--	--	--	--
15	Exp. Capitalised	--	--	--	--	--
16	Other Expenses	16083.21	15398.02	15370.23	1456.30	1023.86
17	P/L Before Other Inc. , Int., Excpt. Items & Tax	4292.53	2712.17	443.91	413.17	1148.09
18	Other Income	2489.47	1852.39	4085.39	2987.11	1248.96
19	P/L Before Int., Excpt. Items & Tax	6782.00	4564.56	4529.30	3400.28	2397.05
20	Interest	2095.41	2257.45	2226.60	2188.94	1518.77
21	P/L Before Exceptional Items & Tax	4686.59	2307.11	2302.70	1211.34	878.28
22	Exceptional Items	-1071.27	203.99	1808.27	1546.46	190.33
23	P/L Before Tax	3615.32	2511.10	4110.97	2757.80	1068.61
24	Tax	482.64	281.24	843.07	-492.96	100.97
25	P/L After Tax from Ordinary Activities	3132.68	2229.86	3267.90	3250.76	967.64
26	Prior Year Adjustments	--	--	--	--	--
27	Extra Ordinary Items	--	--	--	-467.83	-46.19
28	Net Profit/(Loss) For the Period	3132.68	2229.86	3267.90	2782.93	921.45
29	Equity Share Capital	319.56	319.56	319.56	319.56	319.56
30	Reserves Excluding Revaluation Reserves	18045.99	15468.10	13380.03	10560.24	16559.00
31	Equity Dividend Rate (%)	225.00	200.00	200.00	175.00	155.00
32	EPS Before Extra Ordinary	NaN	NaN	NaN	NaN	NaN
33	Basic EPS	9.80	6.97	10.22	10.07	2.49
34	Diluted EPS	9.79	6.97	10.22	10.07	2.49
35	EPS After Extra Ordinary	NaN	NaN	NaN	NaN	NaN
36	Basic EPS.	9.80	6.97	10.22	10.07	2.49
37	Diluted EPS.	9.79	6.97	10.22	10.07	2.49
38	Public Share Holding	NaN	NaN	NaN	NaN	NaN
39	No Of Shares (Crores)	--	--	--	--	--
40	Share Holding (%)	--	--	--	--	--
41	Promoters and Promoter Group Shareholding	NaN	NaN	NaN	NaN	NaN
42	a) Pledged/Encumbered	NaN	NaN	NaN	NaN	NaN
43	- Number of shares (Crores)	--	--	--	--	--
44	- Per. of shares (as a % of the total sh. of p...	--	--	--	--	--
45	- Per. of shares (as a % of the total Share Ca...	--	--	--	--	--
46	b) Non-encumbered	NaN	NaN	NaN	NaN	NaN
47	- Number of shares (Crores).	--	--	--	--	--
48	- Per. of shares (as a % of the total sh. of p...	--	--	--	--	--
49	- Per. of shares (as a % of the total Share Ca...	--	--	--	--	--
# Complete Cashflow statements
# Params
# company_mc_url = MoneyControl company url (you can get this from `get_ticker` function)
# statement_type = 'consolidated' (default) or 'standalone'
# num_years = 5 is the default value any int which is multiple of 5 (if not it will round off to nearest 5 multiples)

# you can only get last <5 timeperiod data
_, raw = mc.get_ticker('tata consumer product')
mc_profile_link = raw[0].get('link_src')
print(mc_profile_link)
mc.get_complete_cashflow_statement(mc_profile_link, statement_type='standalone', num_years=5)
https://www.moneycontrol.com/india/stockpricequote/plantations-teacoffee/tataconsumerproducts/TT
Cash Flow of TATA Consumer Products (in Rs. Cr.)	Mar 25	Mar 24	Mar 23	Mar 22	Mar 21
1	NaN	12 mths	12 mths	12 mths	12 mths	12 mths
2	Net Profit/Loss Before Extraordinary Items And...	1503.24	1352.06	1267.37	1151.09	836.14
3	Net CashFlow From Operating Activities	1274.11	1454.41	1019.27	1158.32	1064.23
4	Net Cash Used In Investing Activities	-1844.66	-1963.92	-601.34	-1064.31	-332.05
5	Net Cash Used From Financing Activities	711.26	403.18	-567.80	-411.35	-330.68
6	Foreign Exchange Gains / Losses	0.00	0.00	0.00	0.00	0.00
7	Adjustments On Amalgamation Merger Demerger Ot...	0.00	0.00	0.00	0.00	0.00
8	Net Inc/Dec In Cash And Cash Equivalents	140.71	-106.33	-149.87	-317.34	401.50
9	Cash And Cash Equivalents Begin of Year	84.67	188.05	327.40	644.74	243.24
10	Cash And Cash Equivalents End Of Year	225.38	81.72	177.53	327.40	644.74
# Complete Ratios (like PE, PB, PAT, etc. etc.)
# Params
# company_mc_url = MoneyControl company url (you can get this from `get_ticker` function)
# statement_type = 'consolidated' (default) or 'standalone'
# num_years = 5 is the default value any int which is multiple of 5 (if not it will round off to nearest 5 multiples)

# you can only get last <5 timeperiod data
_, raw = mc.get_ticker('mtar tech')
mc_profile_link = raw[0].get('link_src')
print(mc_profile_link)
mc.get_complete_ratios_data(mc_profile_link, statement_type='standalone', num_years=5)
https://www.moneycontrol.com/india/stockpricequote/aerospacedefence/mtartechnologies/MT15
Key Financial Ratios of MTAR Technologies (in Rs. Cr.)	Mar 25	Mar 24	Mar 23	Mar 22	Mar 21
1	Per Share Ratios	NaN	NaN	NaN	NaN	NaN
2	Basic EPS (Rs.)	17.51	18.29	33.83	19.79	17.00
3	Diluted EPS (Rs.)	17.51	18.29	33.83	19.79	17.00
4	Cash EPS (Rs.)	27.84	25.65	39.78	24.45	19.06
5	Book Value [ExclRevalReserve]/Share (Rs.)	237.56	220.15	201.83	168.98	155.00
6	Book Value [InclRevalReserve]/Share (Rs.)	237.56	220.15	201.83	168.98	155.00
7	Dividend / Share(Rs.)	0.00	0.00	0.00	3.00	3.00
8	Revenue from Operations/Share (Rs.)	219.76	188.57	186.40	104.69	80.12
9	PBDIT/Share (Rs.)	41.09	38.37	56.46	33.55	27.44
10	PBIT/Share (Rs.)	30.76	31.01	50.52	28.89	23.36
11	PBT/Share (Rs.)	23.56	23.81	45.80	26.73	21.08
12	Net Profit/Share (Rs.)	17.51	18.29	33.84	19.79	14.98
13	Profitability Ratios	NaN	NaN	NaN	NaN	NaN
14	PBDIT Margin (%)	18.69	20.34	30.28	32.04	34.24
15	PBIT Margin (%)	13.99	16.44	27.10	27.60	29.15
16	PBT Margin (%)	10.71	12.62	24.57	25.53	26.31
17	Net Profit Margin (%)	7.96	9.70	18.15	18.90	18.70
18	Return on Networth / Equity (%)	7.36	8.30	16.76	11.71	9.66
19	Return on Capital Employed (%)	11.24	11.91	21.51	15.80	14.45
20	Return on Assets (%)	4.77	5.59	9.79	8.36	7.85
21	Total Debt/Equity (X)	0.24	0.28	0.23	0.18	0.03
22	Asset Turnover Ratio (%)	0.63	0.56	0.64	0.49	42.03
23	Liquidity Ratios	NaN	NaN	NaN	NaN	NaN
24	Current Ratio (X)	2.15	2.75	2.04	2.80	4.46
25	Quick Ratio (X)	0.95	1.06	0.91	1.77	3.31
26	Inventory Turnover Ratio (X)	1.01	0.87	1.13	1.15	2.40
27	Dividend Payout Ratio (NP) (%)	0.00	0.00	0.00	30.31	17.42
28	Dividend Payout Ratio (CP) (%)	0.00	0.00	0.00	24.54	13.69
29	Earnings Retention Ratio (%)	0.00	0.00	0.00	69.69	82.58
30	Cash Earnings Retention Ratio (%)	0.00	0.00	0.00	75.46	86.31
31	Valuation Ratios	NaN	NaN	NaN	NaN	NaN
32	Enterprise Value (Cr.)	4100.72	5318.30	4975.58	5406.56	2970.49
33	EV/Net Operating Revenue (X)	6.07	9.17	8.68	16.79	12.05
34	EV/EBITDA (X)	32.44	45.06	28.65	52.40	35.19
35	MarketCap/Net Operating Revenue (X)	5.83	8.93	8.48	16.70	12.78
36	Retention Ratios (%)	0.00	0.00	0.00	69.68	82.57
37	Price/BV (X)	5.39	7.65	7.83	10.35	6.61
38	Price/Net Operating Revenue	5.83	8.93	8.48	16.70	12.78
39	Earnings Yield	0.01	0.01	0.02	0.01	0.01
# Capital Structure Statement
# Params
# company_mc_url = MoneyControl company url (you can get this from `get_ticker` function)

# you can only get last <5 timeperiod data
_, raw = mc.get_ticker('aarti ind')
mc_profile_link = raw[0].get('link_src')
print(mc_profile_link)
mc.get_complete_capital_structure_statement(mc_profile_link)
https://www.moneycontrol.com/india/stockpricequote/chemicals/aartiindustries/AI45
Period	Instrument	Authorized Capital	Issued Capital	- P A I D U P -
FromTo	Unnamed: 1_level_1	(Rs. cr)	(Rs. cr)	Shares (nos)	Face Value	Capital
0	20232024	Equity Share	300.00000	181.25	362504035	5	181.25
1	20222023	Equity Share	300.00000	181.25	362504035	5	181.25
2	20212022	Equity Share	1500.00000	181.25	362504035	5	181.25
3	20202021	Equity Share	115.07516	87.12	174234474	5	87.12
4	20192020	Equity Share	115.07516	87.12	174234474	5	87.12
5	20182019	Equity Share	115.07516	43.33	86668647	5	43.33
6	20172018	Equity Share	115.07516	40.65	81300000	5	40.65
7	20162017	Equity Share	115.07516	41.06	82120383	5	41.06
8	20152016	Equity Share	115.07516	41.66	83320383	5	41.66
9	20142015	Equity Share	62.50000	44.30	88591687	5	44.30
10	20132014	Equity Share	62.50000	44.30	88591687	5	44.30
11	20122013	Equity Share	62.50000	39.56	79120073	5	39.56
12	20112012	Equity Share	62.50000	39.56	79120073	5	39.56
13	20102011	Equity Share	62.50000	38.36	76720073	5	38.36
14	20092010	Equity Share	62.50000	38.36	76720073	5	38.36
15	20082009	Equity Share	62.50000	36.40	72809424	5	36.40
16	20072008	Equity Share	45.00000	36.40	72809424	5	36.40
17	20062007	Equity Share	45.00000	36.40	72809424	5	36.40
18	20052006	Equity Share	45.00000	36.40	72809424	5	36.40
19	20042005	Equity Share	40.00000	36.40	36404712	10	36.40
20	20032004	Equity Share	20.00000	12.13	12134904	10	12.13
21	20022003	Equity Share	20.00000	12.13	12134904	10	12.13
22	20012002	Equity Share	20.00000	12.13	12134904	10	12.13
23	20002001	Equity Share	20.00000	11.62	11622379	10	11.62
24	19992000	Equity Share	20.00000	11.63	11634333	10	11.63
25	19981999	Equity Share	20.00000	11.63	11634333	10	11.63
26	19941998	Equity Share	2.00000	1.08	1080100	10	1.08
27	19931994	Equity Share	6.00000	3.90	3900500	10	3.90
28	19921993	Equity Share	6.00000	3.90	3900500	10	3.90
29	19901992	Equity Share	6.00000	2.90	2900000	10	2.90

from Technical import NSE
import pandas as pd
import requests
from datetime import datetime
from io import StringIO
nse = NSE()
# Some NSE basic functions this is available any NSE Object (Technical OR Derivatives)
# searching
search_res = nse.search('Syrma SGS')
print(search_res.get('symbols')[0].get('symbol'))

# Last Traded date
print(nse.get_last_traded_date())

# Last traded Status and Nifty val
print(nse.get_market_status_and_current_val())

# NSE Equity Meta info
print(nse.get_nse_equity_meta_info('SYRMA'))
SYRMA
2025-07-07
('Open', 25438.5)
{'symbol': 'SYRMA', 'companyName': 'Syrma SGS Technology Limited', 'industry': 'Industrial Products', 'activeSeries': ['EQ', 'T0'], 'debtSeries': [], 'isFNOSec': False, 'isCASec': False, 'isSLBSec': True, 'isDebtSec': False, 'isSuspended': False, 'tempSuspendedSeries': [], 'isETFSec': False, 'isDelisted': False, 'isin': 'INE0DYJ01015', 'slb_isin': 'INE0DYJ01015', 'listingDate': '2022-08-26', 'isMunicipalBond': False, 'isHybridSymbol': False, 'quotepreopenstatus': {'equityTime': '07-Jul-2025 11:58:25', 'preOpenTime': '07-Jul-2025 09:07:11', 'QuotePreOpenFlag': False}}
New Way to get the OHLCV data from charting.nseindia.com (Lot more Timeframes and date ranges supported)
# NSE New OHLC data from charting.nseindia.com

# Get the mappings (Its not same as NSE website ticker, Get the mapping from `get_charting_mappings()` function)
charting_mappings = nse.get_charting_mappings() # get the Trading Symbol from this DataFrame (includes Equity and F&O instruments, Indices, etc.)
print(charting_mappings.head())

ohlc_df = nse.get_ohlc_from_charting('Nifty 500', '1Min', datetime(2025, 7, 4), datetime(2025, 7, 6))
print(ohlc_df.head())
   ScripCode     TradingSymbol       Description  InstrumentType
0      26000          Nifty 50          Nifty 50               0
1      26003         Nifty 500         Nifty 500               0
2      26008          Nifty IT          Nifty IT               0
3      26009        Nifty Bank        Nifty Bank               0
4      26010  Nifty Midcap 100  Nifty MIDCAP 100               0
            timestamp      open      high       low     close  volume
0 2025-07-04 09:15:59  23553.50  23567.30  23531.45  23545.15       1
1 2025-07-04 09:16:59  23544.85  23544.85  23521.85  23531.75       1
2 2025-07-04 09:17:59  23531.15  23546.60  23527.30  23540.75       1
3 2025-07-04 09:18:59  23541.20  23546.30  23527.85  23532.15       1
4 2025-07-04 09:19:59  23531.40  23533.90  23520.90  23524.80       1
imp_reports_link = nse.get_important_reports()
imp_reports_link[:5]
[{'name': 'CM-UDiFF Common Bhavcopy Final (zip)',
  'type': 'daily-reports',
  'category': 'capital-market',
  'section': 'equities',
  'link': 'https://nsearchives.nseindia.com/content/cm/BhavCopy_NSE_CM_0_0_0_20250704_F_0000.csv.zip'},
 {'name': 'CM - Market Activity Report',
  'type': 'daily-reports',
  'category': 'capital-market',
  'section': 'equities',
  'link': 'https://nsearchives.nseindia.com/archives/equities/mkt/MA040725.csv'},
 {'name': 'CM - Security-wise Delivery Positions',
  'type': 'daily-reports',
  'category': 'capital-market',
  'section': 'equities',
  'link': 'https://nsearchives.nseindia.com/archives/equities/mto/MTO_04072025.DAT'},
 {'name': 'CM - List of securities for auction',
  'type': 'daily-reports',
  'category': 'capital-market',
  'section': 'equities',
  'link': 'https://nsearchives.nseindia.com/content/nsccl/AUB_2025126_04072025.csv'},
 {'name': 'CM - Category-wise Turnover',
  'type': 'daily-reports',
  'category': 'capital-market',
  'section': 'equities',
  'link': 'https://nsearchives.nseindia.com/archives/equities/cat/cat_turnover_040725.xls'}]
# Let's say you need report of `CM - Security-wise Delivery Positions`
report_link = imp_reports_link[3].get('link')
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/csv'
}
response = requests.get(report_link, headers=headers, timeout=15)
pd.read_csv(StringIO(response.text)).head()
Confirmed list of securities to be auctioned in A 2025126 to be held on Jul 04 2025.
Sr No	Symbol	Series	Total Qty
1	360ONE	EQ	100
2	3PLAND	EQ	2
3	63MOONS	EQ	344
4	AARTIPHARM	EQ	1
# NSE turnover data
trade_df = nse.get_nse_turnover()
trade_df.head()
segment	instrument	notionalTurnover	premiumTurnover	noOfTrades	volume	oivalue	mktTimeStamp	value	averageTrade	...	prevInstrument	prevNotionalTurnover	prevPremiumTurnover	prevNoOfTrades	prevVolume	prevOivalue	prevMktTimeStamp	prevValue	prevAverageTrade	prevNoOfOrders
0	CM	Equity	3.749791e+11	0.0	14136338	2376588844	0.0	2025-07-07 11:59:07	3.749791e+11	26526.0	...	None	8.853112e+11	0.0	29766554	3618100940	0.0	2025-07-04 16:00:00	8.853112e+11	NaN	567705087
1	CM	SME	1.849900e+09	0.0	9132	11430245	0.0	2025-07-07 11:59:07	1.849900e+09	202573.0	...	None	2.574248e+09	0.0	14488	16105824	0.0	2025-07-04 15:57:54	2.574248e+09	NaN	567705087
2	CM	Others	9.949460e+07	0.0	1475	198103	0.0	2025-07-07 11:59:06	9.949460e+07	67454.0	...	None	3.227739e+08	0.0	3338	1661101	0.0	2025-07-04 15:56:04	3.227739e+08	NaN	567705087
3	total	Total	NaN	NaN	14146945	2388217192	0.0	2025-07-07 11:59:07	3.769285e+11	26644.0	...	None	NaN	NaN	29784380	3635867865	0.0	2025-07-04 16:00:00	8.882082e+11	29821.0	567705087
4	FO	Index Futures	8.251432e+10	0.0	30564	42482	302001.0	2025-07-07 11:59:04	8.251432e+10	2699722.0	...	None	1.903632e+11	0.0	69750	98399	295952.0	2025-07-04 15:30:00	1.903632e+11	NaN	3821623965
5 rows × 21 columns

All Indices in NSE Exchange
nse.get_all_indices()
key	index	indexSymbol	last	variation	percentChange	open	high	low	previousClose	...	date365dAgo	chart365dPath	date30dAgo	perChange30d	chart30dPath	chartTodayPath	previousDay	oneWeekAgo	oneMonthAgo	oneYearAgo
0	INDICES ELIGIBLE IN DERIVATIVES	NIFTY 50	NIFTY 50	25439.35	-21.65	-0.09	25450.45	25489.80	25407.25	25461.00	...	05-Jul-2024	https://nsearchives.nseindia.com/365d/NIFTY-50...	06-Jun-2025	1.83	https://nsearchives.nseindia.com/30d/NIFTY-50.svg	https://nsearchives.nseindia.com/today/NIFTY-5...	25405.30	25517.05	25003.05	24323.85
1	INDICES ELIGIBLE IN DERIVATIVES	NIFTY NEXT 50	NIFTY NEXT 50	68681.00	73.20	0.11	68692.85	68869.95	68544.60	68607.80	...	05-Jul-2024	https://nsearchives.nseindia.com/365d/NIFTY-NE...	06-Jun-2025	0.90	https://nsearchives.nseindia.com/30d/NIFTY-NEX...	https://nsearchives.nseindia.com/today/NIFTY-N...	68355.85	68998.20	67992.85	73426.55
2	INDICES ELIGIBLE IN DERIVATIVES	NIFTY BANK	NIFTY BANK	56957.90	-74.00	-0.13	56938.70	57152.20	56854.05	57031.90	...	05-Jul-2024	https://nsearchives.nseindia.com/365d/NIFTY-BA...	06-Jun-2025	0.80	https://nsearchives.nseindia.com/30d/NIFTY-BAN...	https://nsearchives.nseindia.com/today/NIFTY-B...	56791.95	57312.75	56578.40	52660.35
3	INDICES ELIGIBLE IN DERIVATIVES	NIFTY FINANCIAL SERVICES	NIFTY FIN SERVICE	26808.20	-58.10	-0.22	26837.85	26894.70	26772.05	26866.30	...	05-Jul-2024	https://nsearchives.nseindia.com/365d/NIFTY-FI...	06-Jun-2025	0.06	https://nsearchives.nseindia.com/30d/NIFTY-FIN...	https://nsearchives.nseindia.com/today/NIFTY-F...	26734.90	27174.45	26848.90	23641.75
4	INDICES ELIGIBLE IN DERIVATIVES	NIFTY MIDCAP SELECT	NIFTY MID SELECT	13430.90	14.90	0.11	13425.95	13462.05	13352.40	13416.00	...	05-Jul-2024	https://nsearchives.nseindia.com/365d/NIFTY-MI...	06-Jun-2025	2.05	https://nsearchives.nseindia.com/30d/NIFTY-MID...	https://nsearchives.nseindia.com/today/NIFTY-M...	13462.55	13433.85	13146.00	12520.35
...	...	...	...	...	...	...	...	...	...	...	...	...	...	...	...	...	...	...	...	...	...
118	FIXED INCOME INDICES	NIFTY COMPOSITE G-SEC INDEX	NIFTY GS COMPSITE	3028.70	1.75	0.05	3027.51	3028.98	3027.45	3026.95	...	05-Jul-2024	https://nsearchives.nseindia.com/365d/NIFTY-GS...	06-Jun-2025	-0.28	https://nsearchives.nseindia.com/30d/NIFTY-GS-...	https://nsearchives.nseindia.com/today/NIFTY-G...	3025.35	3016.03	3034.25	2734.96
119	FIXED INCOME INDICES	NIFTY BHARAT BOND INDEX - APRIL 2030	BHARATBOND-APR30	1533.04	0.81	0.01	1533.07	1533.07	1533.04	1532.23	...	-	-	06-Jun-2025	-0.38	https://nsearchives.nseindia.com/30d/BHARATBON...	https://nsearchives.nseindia.com/today/BHARATB...	1532.74	1525.52	1538.61	NaN
120	FIXED INCOME INDICES	NIFTY BHARAT BOND INDEX - APRIL 2031	BHARATBOND-APR31	1398.15	0.75	0.01	1398.16	1398.16	1398.15	1397.40	...	-	-	06-Jun-2025	-0.55	https://nsearchives.nseindia.com/30d/BHARATBON...	https://nsearchives.nseindia.com/today/BHARATB...	1397.33	1391.81	1405.10	NaN
121	FIXED INCOME INDICES	NIFTY BHARAT BOND INDEX - APRIL 2032	BHARATBOND-APR32	1272.86	0.69	0.01	1272.87	1272.87	1272.86	1272.17	...	-	-	06-Jun-2025	-0.73	https://nsearchives.nseindia.com/30d/BHARATBON...	https://nsearchives.nseindia.com/today/BHARATB...	1271.78	1269.69	1281.19	NaN
122	FIXED INCOME INDICES	NIFTY BHARAT BOND INDEX - APRIL 2033	BHARATBOND-APR33	1237.89	0.67	0.01	1237.90	1237.90	1237.89	1237.22	...	-	-	06-Jun-2025	-0.85	https://nsearchives.nseindia.com/30d/BHARATBON...	https://nsearchives.nseindia.com/today/BHARATB...	1236.67	1235.36	1247.27	NaN
123 rows × 30 columns

Get All Equities from an index
# default it takes `SECURITIES IN F&O`
# This supports all options in this drop down` https://www.nseindia.com/market-data/live-equity-market`
index_df = nse.get_equities_data_from_index()
index_df.head()

index_df = nse.get_equities_data_from_index(index='NIFTY SMALLCAP 100')
index_df.head()
priority	symbol	identifier	open	dayHigh	dayLow	lastPrice	previousClose	change	pChange	...	perChange30d	series	meta_symbol	meta_companyName	meta_industry	meta_slb_isin	meta_listingDate	meta_quotepreopenstatus_equityTime	meta_quotepreopenstatus_preOpenTime	meta_quotepreopenstatus_QuotePreOpenFlag
0	1	NIFTY SMALLCAP 100	NIFTY SMALLCAP 100	19026.80	19060.9	18933.95	18944.95	19033.05	-88.10	-0.46	...	2.42	NaN	NaN	NaN	NaN	NaN	NaN	NaN	NaN	NaN
1	0	IGIL	IGILEQN	381.90	394.9	377.30	394.85	381.35	13.50	3.54	...	-5.16	EQ	IGIL	International Gemmological Institute (India) L...	Diversified Commercial Services	INE0Q9301021	2024-12-20	07-Jul-2025 12:00:55	07-Jul-2025 09:07:11	False
2	0	IIFL	IIFLEQN	475.15	495.5	475.15	490.40	474.85	15.55	3.27	...	5.28	EQ	IIFL	IIFL Finance Limited	Non Banking Financial Company (NBFC)	INE530B01024	2005-05-17	07-Jul-2025 12:00:55	07-Jul-2025 09:07:11	False
3	0	BLS	BLSEQN	365.00	383.9	361.25	374.80	363.70	11.10	3.05	...	-8.77	EQ	BLS	BLS International Services Limited	Tour Travel Related Services	INE153T01027	2016-06-14	07-Jul-2025 12:00:55	07-Jul-2025 09:07:11	False
4	0	NUVAMA	NUVAMAEQN	7251.00	7580.0	7135.50	7400.50	7261.00	139.50	1.92	...	-1.42	EQ	NUVAMA	Nuvama Wealth Management Limited	Stockbroking & Allied	INE531F01015	2023-09-26	07-Jul-2025 12:00:55	07-Jul-2025 09:07:11	False
5 rows × 32 columns

# OHLC Data
nse.get_ohlc_data('EASEMYTRIP', is_index=False)
open	high	low	close
timestamp				
2025-07-07 09:00:00	10.47	10.47	10.35	10.38
2025-07-07 09:05:00	10.38	10.38	10.38	10.38
2025-07-07 09:10:00	NaN	NaN	NaN	NaN
2025-07-07 09:15:00	10.39	10.41	10.34	10.39
2025-07-07 09:20:00	10.39	10.42	10.39	10.40
2025-07-07 09:25:00	10.40	10.41	10.39	10.40
2025-07-07 09:30:00	10.40	10.40	10.38	10.39
2025-07-07 09:35:00	10.40	10.41	10.39	10.41
2025-07-07 09:40:00	10.41	10.42	10.40	10.42
2025-07-07 09:45:00	10.42	10.42	10.38	10.38
2025-07-07 09:50:00	10.40	10.40	10.38	10.38
2025-07-07 09:55:00	10.38	10.39	10.38	10.38
2025-07-07 10:00:00	10.39	10.39	10.37	10.38
2025-07-07 10:05:00	10.38	10.38	10.37	10.38
2025-07-07 10:10:00	10.38	10.39	10.37	10.38
2025-07-07 10:15:00	10.38	10.38	10.36	10.37
2025-07-07 10:20:00	10.38	10.38	10.37	10.38
2025-07-07 10:25:00	10.38	10.38	10.36	10.38
2025-07-07 10:30:00	10.38	10.38	10.37	10.37
2025-07-07 10:35:00	10.37	10.38	10.36	10.38
2025-07-07 10:40:00	10.38	10.38	10.35	10.37
2025-07-07 10:45:00	10.36	10.38	10.35	10.37
2025-07-07 10:50:00	10.37	10.37	10.36	10.36
2025-07-07 10:55:00	10.36	10.38	10.36	10.38
2025-07-07 11:00:00	10.38	10.40	10.38	10.39
2025-07-07 11:05:00	10.39	10.40	10.39	10.39
2025-07-07 11:10:00	10.39	10.40	10.38	10.38
2025-07-07 11:15:00	10.38	10.40	10.38	10.39
2025-07-07 11:20:00	10.39	10.40	10.38	10.39
2025-07-07 11:25:00	10.38	10.39	10.38	10.39
2025-07-07 11:30:00	10.39	10.39	10.38	10.39
2025-07-07 11:35:00	10.39	10.39	10.38	10.38
2025-07-07 11:40:00	10.39	10.39	10.37	10.38
2025-07-07 11:45:00	10.38	10.38	10.37	10.38
2025-07-07 11:50:00	10.38	10.38	10.37	10.38
2025-07-07 11:55:00	10.37	10.38	10.37	10.37
2025-07-07 12:00:00	10.37	10.38	10.37	10.38
Trade Info Data
nse.get_trade_info('CENTRALBK').T
0
currentMarketType	NM
noBlockDeals	True
bulkBlockDeals	[{'name': 'Session I'}, {'name': 'Session II'}]
info_symbol	CENTRALBK
info_companyName	Central Bank of India
...	...
securityWiseDP_quantityTraded	1926099
securityWiseDP_deliveryQuantity	944407
securityWiseDP_deliveryToTradedQuantity	49.03
securityWiseDP_seriesRemarks	None
securityWiseDP_secWiseDelPosDate	07-JUL-2025 11:00:00
115 rows × 1 columns

Corporate Disclosures
nse.get_corporate_disclosures('EASEMYTRIP')
{'EASEMYTRIP': {'latest_announcements': {'data': [{'symbol': 'EASEMYTRIP',
     'broadcastdate': '02-Jul-2025 12:21:50',
     'subject': 'Change in Directors/ Key Managerial Personnel/ Auditor/ Compliance Officer/ Share Transfer Agent'},
    {'symbol': 'EASEMYTRIP',
     'broadcastdate': '01-Jul-2025 20:09:27',
     'subject': 'Change in Director(s)'},
    {'symbol': 'EASEMYTRIP',
     'broadcastdate': '01-Jul-2025 19:50:47',
     'subject': 'Shareholders meeting'},
    {'symbol': 'EASEMYTRIP',
     'broadcastdate': '01-Jul-2025 18:29:01',
     'subject': 'Cessation'},
    {'symbol': 'EASEMYTRIP',
     'broadcastdate': '30-Jun-2025 19:38:37',
     'subject': 'Clarification - Financial Results'},
    {'symbol': 'EASEMYTRIP',
     'broadcastdate': '27-Jun-2025 16:06:56',
     'subject': 'Trading Window-XBRL'},
    {'symbol': 'EASEMYTRIP',
     'broadcastdate': '25-Jun-2025 19:07:04',
     'subject': 'General Updates'},
    {'symbol': 'EASEMYTRIP',
     'broadcastdate': '24-Jun-2025 12:17:24',
     'subject': 'Trading Window'}]},
  'corporate_actions': {'data': [{'symbol': 'EASEMYTRIP',
     'exdate': '29-Nov-2024',
     'purpose': 'Bonus 1:1'},
    {'symbol': 'EASEMYTRIP',
     'exdate': '19-Dec-2023',
     'purpose': 'Interim Dividend - Re 0.10 Per Share'},
    {'symbol': 'EASEMYTRIP',
     'exdate': '21-Nov-2022',
     'purpose': 'Face Value Split (Sub-Division) - From Rs 2/- Per Share To Re 1/- Per Share'},
    {'symbol': 'EASEMYTRIP', 'exdate': '21-Nov-2022', 'purpose': 'Bonus 3:1'},
    {'symbol': 'EASEMYTRIP', 'exdate': '28-Feb-2022', 'purpose': 'Bonus 1:1'},
    {'symbol': 'EASEMYTRIP',
     'exdate': '18-Nov-2021',
     'purpose': ' Interim Dividend - Re 1  Per Share'},
    {'symbol': 'EASEMYTRIP',
     'exdate': '27-Apr-2021',
     'purpose': ' Interim Dividend - Rs 2 Per Share'}]},
  'shareholdings_patterns': {'data': {'30-Jun-2024': [{'Promoter & Promoter Group': '  64.30'},
     {'Public': '  35.70'},
     {'Shares held by Employee Trusts': '   0.00'},
     {'Total': ' 100.00'}],
    '30-Sep-2024': [{'Promoter & Promoter Group': '  50.38'},
     {'Public': '  49.62'},
     {'Shares held by Employee Trusts': '   0.00'},
     {'Total': ' 100.00'}],
    '31-Dec-2024': [{'Promoter & Promoter Group': '  50.38'},
     {'Public': '  49.62'},
     {'Shares held by Employee Trusts': '   0.00'},
     {'Total': ' 100.00'}],
    '31-Mar-2025': [{'Promoter & Promoter Group': '  48.97'},
     {'Public': '  51.03'},
     {'Shares held by Employee Trusts': '   0.00'},
     {'Total': ' 100.00'}],
    '12-Apr-2025': [{'Promoter & Promoter Group': '  47.30'},
     {'Public': '  52.70'},
     {'Shares held by Employee Trusts': '   0.00'},
     {'Total': ' 100.00'}]}},
  'financial_results': {'data': [{'from_date': None,
     'to_date': '31 Mar 2025',
     'expenditure': None,
     'income': '9385',
     'audited': 'Audited',
     'cumulative': None,
     'consolidated': None,
     'reDilEPS': '0.02',
     'reProLossBefTax': '869.3',
     'proLossAftTax': '639.7',
     're_broadcast_timestamp': '30-May-2025 22:42',
     'xbrl_attachment': 'https://nsearchives.nseindia.com/corporate/xbrl/INTEGRATED_FILING_INDAS_1460876_30052025104255_WEB.xml',
     'na_attachment': None},
    {'from_date': None,
     'to_date': '31 Mar 2025',
     'expenditure': None,
     'income': '14327.3',
     'audited': 'Audited',
     'cumulative': None,
     'consolidated': None,
     'reDilEPS': '0.04',
     'reProLossBefTax': '1233.2',
     'proLossAftTax': '1390.3',
     're_broadcast_timestamp': '18-JUN-2025 11:44',
     'xbrl_attachment': 'https://nsearchives.nseindia.com/corporate/xbrl/INTEGRATED_FILING_INDAS_1467837_18062025114446_WEB.xml',
     'na_attachment': None},
    {'from_date': None,
     'to_date': '31 Mar 2025',
     'expenditure': None,
     'income': '14327.3',
     'audited': 'Audited',
     'cumulative': None,
     'consolidated': None,
     'reDilEPS': '0.04',
     'reProLossBefTax': '1233.2',
     'proLossAftTax': '1390.3',
     're_broadcast_timestamp': '30-May-2025 22:47',
     'xbrl_attachment': 'https://nsearchives.nseindia.com/corporate/xbrl/INTEGRATED_FILING_INDAS_1460892_30052025104700_WEB.xml',
     'na_attachment': None},
    {'from_date': '01 Oct 2024',
     'to_date': '31 Dec 2024',
     'expenditure': '6558.3',
     'income': '11052.5',
     'audited': 'Un-Audited',
     'cumulative': 'Non-cumulative',
     'consolidated': 'Non-Consolidated',
     'reDilEPS': '0.1',
     'reProLossBefTax': '4494.2',
     'proLossAftTax': '3351.7',
     're_broadcast_timestamp': '14-Feb-2025 18:51',
     'xbrl_attachment': 'https://nsearchives.nseindia.com/corporate/xbrl/INDAS_120703_1385122_14022025065115.xml',
     'na_attachment': 'https://nsearchives.nseindia.com/na_attachments/EASEMYTRIP_NA_14022025185115_1.zip'},
    {'from_date': '01 Jul 2024',
     'to_date': '30 Sep 2024',
     'expenditure': '7140.9',
     'income': '10917.8',
     'audited': 'Un-Audited',
     'cumulative': 'Non-cumulative',
     'consolidated': 'Non-Consolidated',
     'reDilEPS': '0.18',
     'reProLossBefTax': '3776.9',
     'proLossAftTax': '2779.6',
     're_broadcast_timestamp': '14-Nov-2024 21:18',
     'xbrl_attachment': 'https://nsearchives.nseindia.com/corporate/xbrl/INDAS_116396_1313342_14112024091855.xml',
     'na_attachment': 'https://nsearchives.nseindia.com/na_attachments/EASEMYTRIP_NA_14112024211855_1.zip'}]},
  'borad_meeting': {'data': [{'symbol': 'EASEMYTRIP',
     'purpose': 'EASY TRIP PLANNERS LIMITED has informed the Exchange about Board Meeting to be held on 30-May-2025 to inter-alia consider and approve the Audited Financial results of the Company for the Yearly ended March 2025 .',
     'meetingdate': '30-May-2025'},
    {'symbol': 'EASEMYTRIP',
     'purpose': 'To consider and approve the financial results for the period ended March 31, 2025',
     'meetingdate': '30-May-2025'},
    {'symbol': 'EASEMYTRIP',
     'purpose': 'EASY TRIP PLANNERS LIMITED has informed the Exchange about Board Meeting to be held on 12-Apr-2025 to consider Other business.',
     'meetingdate': '12-Apr-2025'},
    {'symbol': 'EASEMYTRIP',
     'purpose': 'To consider other business matters',
     'meetingdate': '12-Apr-2025'},
    {'symbol': 'EASEMYTRIP',
     'purpose': 'EASY TRIP PLANNERS LIMITED has informed the Exchange about Board Meeting to be held on 24-Mar-2025 to consider Other business.',
     'meetingdate': '24-Mar-2025'},
    {'symbol': 'EASEMYTRIP',
     'purpose': 'To consider other business matters',
     'meetingdate': '24-Mar-2025'},
    {'symbol': 'EASEMYTRIP',
     'purpose': 'EASY TRIP PLANNERS LIMITED has informed the Exchange about Board Meeting to be held on 14-Feb-2025 to inter-alia consider and approve the Unaudited Financial results of the Company for the Quarterly ended December 2024 .',
     'meetingdate': '14-Feb-2025'},
    {'symbol': 'EASEMYTRIP',
     'purpose': 'To consider and approve the financial results for the period ended December 31, 2024',
     'meetingdate': '14-Feb-2025'}]}}}
SME Data
# Get SME (Small Medium Enterprises) stocks data
nse.get_sme_stocks()
symbol	series	open	dayHigh	dayLow	lastPrice	change	pChange	previousClose	stockIndClosePrice	...	nearWKH	nearWKL	ca	chartTodayPath	perChange365d	date365dAgo	chart365dPath	date30dAgo	perChange30d	chart30dPath
0	IDEALTECHO	SM	155.00	155.00	155.00	155.00	23.00	17.42	146.00	0	...	0.000000	-76.136364		https://nsearchives.nseindia.com/today/IDEALTE...	-	-	-	04-Jun-2025	5.6	https://nsearchives.nseindia.com/30d/IDEALTECH...
1	JAINIK	SM	67.50	75.20	67.50	74.25	6.40	9.43	61.20	0	...	13.763066	-22.524752		https://nsearchives.nseindia.com/today/JAINIKS...	-	-	-	-	-	-
2	QMSMEDI	SM	81.90	85.00	80.85	85.00	7.25	9.32	79.15	0	...	44.769331	-17.484451		https://nsearchives.nseindia.com/today/QMSMEDI...	-47.34	05-Jul-2024	https://nsearchives.nseindia.com/365d/QMSMEDI-...	06-Jun-2025	-12.15	https://nsearchives.nseindia.com/30d/QMSMEDI-S...
3	MONOLITH	SM	319.95	345.00	310.00	337.40	27.80	8.98	321.50	0	...	2.202899	-53.748006		https://nsearchives.nseindia.com/today/MONOLIT...	-	-	-	-	-	-
4	PATILAUTOM	SM	204.90	231.65	202.00	219.00	14.75	7.22	194.55	0	...	5.460825	-41.290323		https://nsearchives.nseindia.com/today/PATILAU...	NaN	NaN	NaN	NaN	NaN	NaN
...	...	...	...	...	...	...	...	...	...	...	...	...	...	...	...	...	...	...	...	...	...
424	TCL	SM	114.95	114.95	108.50	108.60	-6.40	-5.57	119.00	0	...	56.262586	-40.764744		https://nsearchives.nseindia.com/today/TCLSMN.svg	-47.87	05-Jul-2024	https://nsearchives.nseindia.com/365d/TCL-SM.svg	06-Jun-2025	25.96	https://nsearchives.nseindia.com/30d/TCL-SM.svg
425	USASEEDS	SM	163.00	164.00	157.00	160.00	-10.00	-5.88	176.90	0	...	52.920406	-22.417751		https://nsearchives.nseindia.com/today/USASEED...	-44.54	05-Jul-2024	https://nsearchives.nseindia.com/365d/USASEEDS...	05-Jun-2025	-17.07	https://nsearchives.nseindia.com/30d/USASEEDS-...
426	NEPHROCARE	SM	114.15	117.25	99.95	110.75	-7.70	-6.50	123.15	0	...	70.762936	-10.805403		https://nsearchives.nseindia.com/today/NEPHROC...	-	-	-	06-Jun-2025	-10.64	https://nsearchives.nseindia.com/30d/NEPHROCAR...
427	MICROPRO	SM	24.40	24.40	21.55	22.20	-1.55	-6.53	24.50	0	...	55.060729	-22.991690		https://nsearchives.nseindia.com/today/MICROPR...	-46.33	05-Jul-2024	https://nsearchives.nseindia.com/365d/MICROPRO...	06-Jun-2025	1.06	https://nsearchives.nseindia.com/30d/MICROPRO-...
428	PARAMATRIX	SM	90.00	90.00	90.00	90.00	-7.00	-7.22	97.50	0	...	32.381668	-41.509434		https://nsearchives.nseindia.com/today/PARAMAT...	-	-	-	06-Jun-2025	-5.13	https://nsearchives.nseindia.com/30d/PARAMATRI...
429 rows × 24 columns

SGB Data
# Get SGB (Sovereign Gold Bond) data
nse.get_sgb_data()
symbol	open	high	low	issue_price	ltP	chn	per	qty	trdVal	...	nearWKH	nearWKL	maturityDate	chartTodayPath	perChange365d	date365dAgo	chart365dPath	date30dAgo	perChange30d	chart30dPath
0	SGBNOV25	10397.9	10397.9	10397.9	2884	10397.9	567.9	5.78	5	51989.5	...	0.000000	-44.918467	NOV25	https://nsearchives.nseindia.com/today/SGBNOV2...	29.36	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBNOV25...	02-Jun-2025	5.59	https://nsearchives.nseindia.com/30d/SGBNOV25-...
1	SGBNOV26	9919.99	9919.99	9919.99	3133	9919.99	150.98	1.55	1	9919.99	...	0.800100	-39.718169	NOV26	https://nsearchives.nseindia.com/today/SGBNOV2...	27.88	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBNOV26...	06-Jun-2025	1.5	https://nsearchives.nseindia.com/30d/SGBNOV26-...
2	SGBFEB28IX	9780	9880	9779.99	0	9880	100	1.02	3	29439.99	...	0.703518	-37.988827	B28IX	https://nsearchives.nseindia.com/today/SGBFEB2...	30.21	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBFEB28...	05-Jun-2025	0.82	https://nsearchives.nseindia.com/30d/SGBFEB28I...
3	SGBJAN30IX	9975.59	9999.99	9830.02	0	9999.99	74.03	0.75	16	159197.12	...	1.910106	-40.844930	N30IX	https://nsearchives.nseindia.com/today/SGBJAN3...	30.60	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBJAN30...	06-Jun-2025	2.07	https://nsearchives.nseindia.com/30d/SGBJAN30I...
4	SGBAUG30	9926	10289.99	9926	0	10084.99	58.49	0.58	21	210912.45	...	3.019617	-35.806491	AUG30	https://nsearchives.nseindia.com/today/SGBAUG3...	31.11	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBAUG30...	06-Jun-2025	0.77	https://nsearchives.nseindia.com/30d/SGBAUG30-...
5	SGBFEB29XI	9830.01	9866	9821	0	9866	35.99	0.37	26	255819.98	...	1.586035	-35.150685	B29XI	https://nsearchives.nseindia.com/today/SGBFEB2...	30.79	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBFEB29...	06-Jun-2025	1.36	https://nsearchives.nseindia.com/30d/SGBFEB29X...
6	SGBSEP31II	10001.1	10330	10000	0	10114.99	31.07	0.31	1321	13290197.91	...	3.436850	-34.667226	P31II	https://nsearchives.nseindia.com/today/SGBSEP3...	30.86	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBSEP31...	06-Jun-2025	1.4	https://nsearchives.nseindia.com/30d/SGBSEP31I...
7	SGBOCT27VI	9775	9799	9775	0	9799	24	0.25	15	146745	...	1.517588	-36.097222	T27VI	https://nsearchives.nseindia.com/today/SGBOCT2...	30.17	04-Jul-2024	https://nsearchives.nseindia.com/365d/SGBOCT27...	06-Jun-2025	1.31	https://nsearchives.nseindia.com/30d/SGBOCT27V...
8	SGBAPR28I	9874	9950	9800	0	9850	24.06	0.24	126	1242419.22	...	1.735540	-36.596866	PR28I	https://nsearchives.nseindia.com/today/SGBAPR2...	26.49	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBAPR28...	06-Jun-2025	0.57	https://nsearchives.nseindia.com/30d/SGBAPR28I...
9	SGBMAY29I	9850	9850	9800.01	0	9844.99	7.29	0.07	95	935317.75	...	1.055377	-35.196237	AY29I	https://nsearchives.nseindia.com/today/SGBMAY2...	30.68	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBMAY29...	06-Jun-2025	1.96	https://nsearchives.nseindia.com/30d/SGBMAY29I...
10	SGBJUN31I	10180	10180	10013.01	0	10075.01	2.31	0.02	197	1987123.24	...	2.656908	-35.144333	UN31I	https://nsearchives.nseindia.com/today/SGBJUN3...	31.54	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBJUN31...	06-Jun-2025	1.66	https://nsearchives.nseindia.com/30d/SGBJUN31I...
11	SGBDEC26	0	0	0	3069	10175.81	0	0.00	0	0	...	0.041159	-41.330694	DEC26	https://nsearchives.nseindia.com/today/SGBDEC2...	33.21	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBDEC26...	03-Jun-2025	2.79	https://nsearchives.nseindia.com/30d/SGBDEC26-...
12	SGBOCT26	9800	9800	9800	3096	9800	0	0.00	25	245000	...	2.874133	-34.707904	OCT26	https://nsearchives.nseindia.com/today/SGBOCT2...	30.67	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBOCT26...	04-Jun-2025	1.99	https://nsearchives.nseindia.com/30d/SGBOCT26-...
13	SGBMAY26	0	0	0	3064	9893.8	0	0.00	0	0	...	2.041584	-37.203320	MAY26	https://nsearchives.nseindia.com/today/SGBMAY2...	31.48	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBMAY26...	06-Jun-2025	2	https://nsearchives.nseindia.com/30d/SGBMAY26-...
14	SGBJUN27	0	0	0	0	9854.02	0	0.00	0	0	...	1.459800	-36.861389	JUN27	https://nsearchives.nseindia.com/today/SGBJUN2...	30.09	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBJUN27...	06-Jun-2025	3.07	https://nsearchives.nseindia.com/30d/SGBJUN27-...
15	SGBOCT25	0	0	0	2906	10050	0	0.00	0	0	...	0.000000	-40.539785	OCT25	https://nsearchives.nseindia.com/today/SGBOCT2...	35.81	03-Jul-2024	https://nsearchives.nseindia.com/365d/SGBOCT25...	06-Jun-2025	3.07	https://nsearchives.nseindia.com/30d/SGBOCT25-...
16	SGBJAN27	0	0	0	3164	9980	0	0.00	0	0	...	0.110099	-37.276479	JAN27	https://nsearchives.nseindia.com/today/SGBJAN2...	31.33	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBJAN27...	06-Jun-2025	3.12	https://nsearchives.nseindia.com/30d/SGBJAN27-...
17	SGBNOV258	9800	9800	9800	2911	9800	0	0.00	2	19600	...	2.000000	-38.028169	OV258	https://nsearchives.nseindia.com/today/SGBNOV2...	32.07	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBNOV25...	06-Jun-2025	1.03	https://nsearchives.nseindia.com/30d/SGBNOV258...
18	SGBOCT25IV	0	0	0	2937	9850	0	0.00	0	0	...	1.980297	-38.517789	T25IV	https://nsearchives.nseindia.com/today/SGBOCT2...	32.44	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBOCT25...	06-Jun-2025	1.55	https://nsearchives.nseindia.com/30d/SGBOCT25I...
19	SGBNOV25VI	0	0	0	2895	9800	0	0.00	0	0	...	0.608519	-34.246575	V25VI	https://nsearchives.nseindia.com/today/SGBNOV2...	31.99	04-Jul-2024	https://nsearchives.nseindia.com/365d/SGBNOV25...	04-Jun-2025	2.08	https://nsearchives.nseindia.com/30d/SGBNOV25V...
20	SGBOCT25V	0	0	0	2921	9900	0	0.00	0	0	...	1.000000	-38.248848	CT25V	https://nsearchives.nseindia.com/today/SGBOCT2...	33.63	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBOCT25...	05-Jun-2025	2.06	https://nsearchives.nseindia.com/30d/SGBOCT25V...
21	SGBDEC25XI	0	0	0	2902	9869.13	0	0.00	0	0	...	7.696128	-37.051263	C25XI	https://nsearchives.nseindia.com/today/SGBDEC2...	31.03	02-Jul-2024	https://nsearchives.nseindia.com/365d/SGBDEC25...	-	-	-
22	SGBDEC2512	0	0	0	2840	9900	0	0.00	0	0	...	1.000000	-36.363636	C2512	https://nsearchives.nseindia.com/today/SGBDEC2...	33.75	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBDEC25...	05-Jun-2025	2.59	https://nsearchives.nseindia.com/30d/SGBDEC251...
23	SGBDEC2513	9825	9825	9825	2816	9825	0	0.00	3	29475	...	1.750000	-35.610766	C2513	https://nsearchives.nseindia.com/today/SGBDEC2...	32.77	04-Jul-2024	https://nsearchives.nseindia.com/365d/SGBDEC25...	03-Jun-2025	2.34	https://nsearchives.nseindia.com/30d/SGBDEC251...
24	SGBJAN26	9990	9990	9990	2831	9990	0	0.00	3	29970	...	0.100000	-39.408123	JAN26	https://nsearchives.nseindia.com/today/SGBJAN2...	33.20	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBJAN26...	02-Jun-2025	4.5	https://nsearchives.nseindia.com/30d/SGBJAN26-...
25	SGBFEB27	0	0	0	3276	9926	0	0.00	0	0	...	0.241206	-37.861111	FEB27	https://nsearchives.nseindia.com/today/SGBFEB2...	32.35	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBFEB27...	05-Jun-2025	1.82	https://nsearchives.nseindia.com/30d/SGBFEB27-...
26	SGBNOV25IX	0	0	0	2914	9923	0	0.00	0	0	...	2.715686	-36.868966	V25IX	https://nsearchives.nseindia.com/today/SGBNOV2...	31.88	04-Jul-2024	https://nsearchives.nseindia.com/365d/SGBNOV25...	06-Jun-2025	1.29	https://nsearchives.nseindia.com/30d/SGBNOV25I...
27	SGBDEC25	0	0	0	2911	9999	0	0.00	0	0	...	4.771429	-37.917241	DEC25	https://nsearchives.nseindia.com/today/SGBDEC2...	26.00	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBDEC25...	-	-	-
28	SGBJUL27	0	0	0	0	9770.25	0	0.00	0	0	...	2.297500	-34.762069	JUL27	https://nsearchives.nseindia.com/today/SGBJUL2...	30.27	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBJUL27...	06-Jun-2025	1.7	https://nsearchives.nseindia.com/30d/SGBJUL27-...
29	SGBJAN29X	9757.01	9847.99	9757.01	0	9845	-3.17	-0.03	4	39295	...	2.990972	-34.770705	AN29X	https://nsearchives.nseindia.com/today/SGBJAN2...	30.13	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBJAN29...	06-Jun-2025	1.82	https://nsearchives.nseindia.com/30d/SGBJAN29X...
30	SGBD29VIII	9853.5	9853.5	9850	0	9850	-3.63	-0.04	40	394122.4	...	1.470441	-34.913026	9VIII	https://nsearchives.nseindia.com/today/SGBD29V...	31.03	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBD29VI...	06-Jun-2025	1.58	https://nsearchives.nseindia.com/30d/SGBD29VII...
31	SGBAUG29V	9945	9950	9850	0	9944.99	-4.86	-0.05	24	238630.8	...	5.393931	-36.008977	UG29V	https://nsearchives.nseindia.com/today/SGBAUG2...	22.96	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBAUG29...	06-Jun-2025	2.59	https://nsearchives.nseindia.com/30d/SGBAUG29V...
32	SGBMAR28X	9839.2	9839.2	9720.02	0	9794	-6	-0.06	78	763752.6	...	3.029703	-35.820275	AR28X	https://nsearchives.nseindia.com/today/SGBMAR2...	29.85	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBMAR28...	06-Jun-2025	1.03	https://nsearchives.nseindia.com/30d/SGBMAR28X...
33	SGBN28VIII	9848	9860.59	9820	0	9859.99	-6.01	-0.06	18	177274.44	...	2.761440	-35.068356	8VIII	https://nsearchives.nseindia.com/today/SGBN28V...	31.09	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBN28VI...	06-Jun-2025	1.88	https://nsearchives.nseindia.com/30d/SGBN28VII...
34	SGBSEP28VI	9817.99	9817.99	9756	0	9816.95	-8.05	-0.08	8	78354.88	...	3.098265	-34.460348	P28VI	https://nsearchives.nseindia.com/today/SGBSEP2...	28.82	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBSEP28...	06-Jun-2025	1.3	https://nsearchives.nseindia.com/30d/SGBSEP28V...
35	SGBMAY28	9829	9829	9821	0	9821	-8	-0.08	6	58941.96	...	1.790000	-35.649171	MAY28	https://nsearchives.nseindia.com/today/SGBMAY2...	30.36	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBMAY28...	06-Jun-2025	1.49	https://nsearchives.nseindia.com/30d/SGBMAY28-...
36	SGBAUG27	9850	9850	9750	0	9850	-8.66	-0.09	42	412663.86	...	3.714565	-33.795164	AUG27	https://nsearchives.nseindia.com/today/SGBAUG2...	28.03	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBAUG27...	06-Jun-2025	0.6	https://nsearchives.nseindia.com/30d/SGBAUG27-...
37	SGBJUL29IV	9800.1	9838	9796.77	0	9829.98	-16.02	-0.16	85	833463.25	...	1.601703	-35.585931	L29IV	https://nsearchives.nseindia.com/today/SGBJUL2...	30.13	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBJUL29...	06-Jun-2025	1.77	https://nsearchives.nseindia.com/30d/SGBJUL29I...
38	SGBOCT27	9800	9800	9780	0	9780	-20	-0.20	12	117379.92	...	3.158729	-35.644938	OCT27	https://nsearchives.nseindia.com/today/SGBOCT2...	30.49	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBOCT27...	05-Jun-2025	2.08	https://nsearchives.nseindia.com/30d/SGBOCT27-...
39	SGBJUN29II	9849.93	9850	9761	0	9830	-19.93	-0.20	167	1643062.9	...	1.690169	-34.842250	N29II	https://nsearchives.nseindia.com/today/SGBJUN2...	29.60	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBJUN29...	06-Jun-2025	2.08	https://nsearchives.nseindia.com/30d/SGBJUN29I...
40	SGBOC28VII	9950	9950	9740	0	9783	-20.15	-0.21	293	2861514.18	...	1.826392	-34.013699	28VII	https://nsearchives.nseindia.com/today/SGBOC28...	30.53	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBOC28V...	06-Jun-2025	1.56	https://nsearchives.nseindia.com/30d/SGBOC28VI...
41	SGBDC27VII	9850	9860	9805	0	9805	-27	-0.27	5	49125	...	1.940194	-36.075664	27VII	https://nsearchives.nseindia.com/today/SGBDC27...	31.39	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBDC27V...	06-Jun-2025	2.2	https://nsearchives.nseindia.com/30d/SGBDC27VI...
42	SGBDE31III	10066	10229.99	10036	0	10160	-29.07	-0.29	692	7031093.68	...	3.222980	-36.010710	31III	https://nsearchives.nseindia.com/today/SGBDE31...	32.25	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBDE31I...	06-Jun-2025	2	https://nsearchives.nseindia.com/30d/SGBDE31II...
43	SGBSEP27	9855	9855	9855	0	9855	-30	-0.30	3	29565	...	1.440144	-34.815321	SEP27	https://nsearchives.nseindia.com/today/SGBSEP2...	32.42	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBSEP27...	05-Jun-2025	2.7	https://nsearchives.nseindia.com/30d/SGBSEP27-...
44	SGBAUG28V	9849.94	9849.99	9751	0	9816.99	-32.95	-0.33	516	5063807.28	...	1.731733	-33.673611	UG28V	https://nsearchives.nseindia.com/today/SGBAUG2...	26.45	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBAUG28...	06-Jun-2025	1.39	https://nsearchives.nseindia.com/30d/SGBAUG28V...
45	SGBFEB32IV	10887.79	10935	10800.01	0	10851.01	-36.78	-0.34	839	9133597.31	...	2.661446	-42.570096	B32IV	https://nsearchives.nseindia.com/today/SGBFEB3...	38.37	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBFEB32...	06-Jun-2025	8.83	https://nsearchives.nseindia.com/30d/SGBFEB32I...
46	SGBJUN30	9987	9998	9853	0	9950	-36.12	-0.36	80	793949.6	...	1.970443	-36.301370	JUN30	https://nsearchives.nseindia.com/today/SGBJUN3...	30.77	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBJUN30...	06-Jun-2025	1.38	https://nsearchives.nseindia.com/30d/SGBJUN30-...
47	SGBDE30III	10024.37	10026	9950	0	9984.99	-39.38	-0.39	95	946229.45	...	2.632960	-36.574887	30III	https://nsearchives.nseindia.com/today/SGBDE30...	31.78	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBDE30I...	06-Jun-2025	0.76	https://nsearchives.nseindia.com/30d/SGBDE30II...
48	SGBJUL28IV	9833	9833	9750	0	9780.5	-52.5	-0.53	33	322885.53	...	2.136282	-35.840278	L28IV	https://nsearchives.nseindia.com/today/SGBJUL2...	29.84	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBJUL28...	06-Jun-2025	1.21	https://nsearchives.nseindia.com/30d/SGBJUL28I...
49	SGBMAR31IV	10075	10140	9951	0	10031	-60.76	-0.60	88	882321.44	...	2.365194	-34.644295	R31IV	https://nsearchives.nseindia.com/today/SGBMAR3...	31.23	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBMAR31...	06-Jun-2025	2.43	https://nsearchives.nseindia.com/30d/SGBMAR31I...
50	SGBSEP29VI	9751.01	9859	9751.01	0	9798.7	-61.3	-0.62	359	3511881.6	...	2.012020	-34.210382	P29VI	https://nsearchives.nseindia.com/today/SGBSEP2...	31.12	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBSEP29...	06-Jun-2025	1.92	https://nsearchives.nseindia.com/30d/SGBSEP29V...
51	SGBJUL25	9750	9799.85	9750	2780	9765	-64.99	-0.66	54	527265.18	...	2.056169	-39.187822	JUL25	https://nsearchives.nseindia.com/today/SGBJUL2...	31.68	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBJUL25...	06-Jun-2025	1.83	https://nsearchives.nseindia.com/30d/SGBJUL25-...
52	SGBJAN29IX	9813.85	9814	9750	0	9751	-64.69	-0.66	209	2042822.43	...	3.445886	-34.089659	N29IX	https://nsearchives.nseindia.com/today/SGBJAN2...	30.86	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBJAN29...	06-Jun-2025	1.28	https://nsearchives.nseindia.com/30d/SGBJAN29I...
53	SGBMAR30X	9949	9949	9826.01	0	9826.01	-77.06	-0.78	241	2377616.83	...	6.195609	-37.465165	AR30X	https://nsearchives.nseindia.com/today/SGBMAR3...	31.42	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBMAR30...	06-Jun-2025	1.93	https://nsearchives.nseindia.com/30d/SGBMAR30X...
54	SGBJU29III	9775	9820	9765	0	9772	-78	-0.79	274	2676963.56	...	2.084070	-34.304563	29III	https://nsearchives.nseindia.com/today/SGBJU29...	31.33	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBJU29I...	06-Jun-2025	2.05	https://nsearchives.nseindia.com/30d/SGBJU29II...
55	SGBNV29VII	9833.66	9833.66	9751.01	0	9751.01	-82.65	-0.84	26	254769.32	...	3.705426	-33.575296	29VII	https://nsearchives.nseindia.com/today/SGBNV29...	30.67	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBNV29V...	06-Jun-2025	1.8	https://nsearchives.nseindia.com/30d/SGBNV29VI...
56	SGBMR29XII	9835.47	9835.47	9736.02	0	9751.05	-84.42	-0.86	60	586135.8	...	1.999497	-32.829815	29XII	https://nsearchives.nseindia.com/today/SGBMR29...	30.79	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBMR29X...	06-Jun-2025	1.89	https://nsearchives.nseindia.com/30d/SGBMR29XI...
57	SGBJUN28	9809.08	9809.08	9700.01	0	9721.01	-102.99	-1.05	55	535680.75	...	3.656892	-35.948675	JUN28	https://nsearchives.nseindia.com/today/SGBJUN2...	30.88	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBJUN28...	06-Jun-2025	1.12	https://nsearchives.nseindia.com/30d/SGBJUN28-...
58	SGBJ28VIII	9850	9850	9705.17	0	9705.17	-179.83	-1.82	20	194827.4	...	3.421534	-33.845952	8VIII	https://nsearchives.nseindia.com/today/SGBJ28V...	32.13	05-Jul-2024	https://nsearchives.nseindia.com/365d/SGBJ28VI...	06-Jun-2025	2.96	https://nsearchives.nseindia.com/30d/SGBJ28VII...
59 rows × 28 columns

ETF Data
# Get ETF (Exchange Traded Fund) data
nse.get_all_etf()
symbol	assets	open	high	low	ltP	chn	per	qty	trdVal	...	stockIndClosePrice	nearWKH	nearWKL	chartTodayPath	perChange365d	date365dAgo	chart365dPath	date30dAgo	perChange30d	chart30dPath
0	MASPTOP50	S&P 500 Top 50 Total Return Index	57.55	57.55	56.15	57.02	0.87	1.55	245410	13968737.2	...	0	12.209392	-56.304825	https://nsearchives.nseindia.com/today/MASPTOP...	27.27	05-Jul-2024	https://nsearchives.nseindia.com/365d/MASPTOP5...	06-Jun-2025	3.71	https://nsearchives.nseindia.com/30d/MASPTOP50...
1	MAFANG	NYSE FANG+ Total Return Index	152.28	152.28	150.18	152.28	2.1	1.40	182842	27819410.3	...	0	0.781861	-70.621849	https://nsearchives.nseindia.com/today/MAFANGE...	52.13	05-Jul-2024	https://nsearchives.nseindia.com/365d/MAFANG-E...	06-Jun-2025	10.74	https://nsearchives.nseindia.com/30d/MAFANG-EQ...
2	FMCGIETF	Nifty FMCG Index	58.17	59.22	56.94	59.1	0.69	1.18	1334771	78631359.61	...	0	16.994382	-11.509434	https://nsearchives.nseindia.com/today/FMCGIET...	-3.15	05-Jul-2024	https://nsearchives.nseindia.com/365d/FMCGIETF...	06-Jun-2025	-1.63	https://nsearchives.nseindia.com/30d/FMCGIETF-...
3	IDFNIFTYET	Nifty 50	279.27	281.43	277.24	279.87	1.98	0.71	832	232727.04	...	0	6.347878	-19.088549	https://nsearchives.nseindia.com/today/IDFNIFT...	6.01	05-Jul-2024	https://nsearchives.nseindia.com/365d/IDFNIFTY...	06-Jun-2025	2.36	https://nsearchives.nseindia.com/30d/IDFNIFTYE...
4	BANKPSU	Nifty PSU Bank Total Return Index	73.79	73.79	71.52	72.12	0.48	0.67	4101	294943.92	...	0	6.337662	-30.439501	https://nsearchives.nseindia.com/today/BANKPSU...	-	-	-	06-Jun-2025	0.28	https://nsearchives.nseindia.com/30d/BANKPSU-E...
...	...	...	...	...	...	...	...	...	...	...	...	...	...	...	...	...	...	...	...	...	...
255	BSLGOLDETF	Gold	88.38	88.38	85.25	85.54	-0.69	-0.80	24121	2063069.13	...	0	8.051166	-51.210889	https://nsearchives.nseindia.com/today/BSLGOLD...	32.72	05-Jul-2024	https://nsearchives.nseindia.com/365d/BSLGOLDE...	06-Jun-2025	0.22	https://nsearchives.nseindia.com/30d/BSLGOLDET...
256	GROWWDEFNC	Nifty India Defence Index- Total Return Index	90.35	91.69	88.17	88.7	-0.76	-0.85	190259	16874070.71	...	0	5.527745	-78.005218	https://nsearchives.nseindia.com/today/GROWWDE...	-	-	-	06-Jun-2025	0.1	https://nsearchives.nseindia.com/30d/GROWWDEFN...
257	UNIONGOLD	Commodity Gold	95.7	95.7	95.2	95.2	-0.85	-0.88	567	54148.5	...	0	4.800000	-16.097561	https://nsearchives.nseindia.com/today/UNIONGO...	-	-	-	06-Jun-2025	0.05	https://nsearchives.nseindia.com/30d/UNIONGOLD...
258	MOGSEC	Nifty 5 yr Benchmark G-Sec Index	62.9	62.9	61.64	62.31	-0.62	-0.99	7752	483182.16	...	0	5.303951	-12.493230	https://nsearchives.nseindia.com/today/MOGSECE...	11.4	05-Jul-2024	https://nsearchives.nseindia.com/365d/MOGSEC-E...	06-Jun-2025	1.5	https://nsearchives.nseindia.com/30d/MOGSEC-EQ...
259	GROWWNET	Index	10.2	10.2	9.84	9.84	-0.12	-1.20	415903	4117439.7	...	0	14.434783	0.000000	https://nsearchives.nseindia.com/today/GROWWNE...	-	-	-	-	-	-
260 rows × 28 columns

ALL Block Deals
# Get all block deals happened today
nse.get_all_today_block_deals()
India VIX
# India (Bharat) VIX (Volatility Index) data
nse.get_india_vix(interval='3Min')
INDIA VIX is No Longer Available on NSE India :( 
Please Use INDIA VIX from MONEYCONTROL

        from Fundamentals import MoneyControl
        moneycontrol = MoneyControl()
        moneycontrol.get_india_vix(interval='1') # Only `1d` (for day interval) or `1`  (for minute interval) is supported
        
from Fundamentals import Tickertape
import pandas as pd
ttp = Tickertape()
# Searching in tickertape
res, raw_data = ttp.get_ticker('Adani wilmar')
print(res)
raw_data[0]
AWL
{'marketCap': 33178.673916925,
 'ticker': 'AWL',
 'brands': [],
 'searchTags_keyword': ['awl agri business ltd', 'awl', 'adani wilmar ltd'],
 'marketCapRank': 250,
 'searchTags': ['awl agri business ltd', 'awl', 'adani wilmar ltd'],
 'exchanges': 'NSE',
 'weight': 1,
 'ticker_keyword': 'AWL',
 'suspended': False,
 'sid': 'AWL',
 'name_suggest': 'AWL Agri Business Ltd',
 'brands_keyword': [],
 'name_keyword': 'AWL Agri Business Ltd',
 'ticker_suggest': 'AWL',
 'name': 'AWL Agri Business Ltd',
 'id': 'AWL',
 'sector': 'Consumer Staples',
 'ticker_key': 'AWL',
 'slug': '/stocks/adani-wilmar-AWL',
 'quote': {'sid': 'AWL',
  'price': 255.35,
  'close': 256.15,
  'change': -0.8,
  'high': 257.75,
  'low': 255,
  'volume': 481734,
  'date': '2025-07-07T06:23:32.000Z'},
 'score': 518.0264,
 'index': 'stock',
 'type': 'stock',
 'match': 'EXACT'}
# Allowed search_places = ['stock', 'index', 'etf', 'mutualfund', 'space', 'profile', 'smallcase', 'all']
_, raw_data = ttp.get_ticker('Nifty 500', search_place='index')
raw_data[1] # here ticker is the unique id of NSE and sid is the id of Tickertape
{'marketCap': '27735710.62',
 'ticker': 'NIFTY 100',
 'weight': 1,
 'ticker_keyword': 'NIFTY 100',
 'type': 'index',
 'suspended': False,
 'sid': '.NIFTY100',
 'name_suggest': 'Nifty 100 Index',
 'name_keyword': 'Nifty 100 Index',
 'ticker_suggest': 'NIFTY 100',
 'name': 'Nifty 100 Index',
 'id': '.NIFTY100',
 'sector': 'Index',
 'ticker_key': 'NIFTY 100',
 'slug': '/indices/nifty-100-index-.NIFTY100',
 'quote': {'sid': '.NIFTY100',
  'price': 26051.7,
  'close': 26066.65,
  'change': -14.95,
  'high': 26106.7,
  'low': 26018.4,
  'volume': 0,
  'date': '2025-07-07T06:23:50.337Z'},
 'score': 1178.5251,
 'index': 'index',
 'match': 'EXACT'}
# Get all tickers (sid in Tickertape) of NIFTY 50
ttp.get_all_nifty_50_ticker()
['ADEL',
 'APSE',
 'APLH',
 'BJFS',
 'AXBK',
 'BRTI',
 'BAJA',
 'BJFN',
 'BAJE',
 'ASPN',
 'REDY',
 'EICH',
 'COAL',
 'CIPL',
 'HDBK',
 'GRAS',
 'HCLT',
 'HDFL',
 'HLL',
 'ICBK',
 'INFY',
 'HROM',
 'HALC',
 'ITC',
 'INBK',
 'JSTL',
 'MAHM',
 'KTKM',
 'LART',
 'MRTI',
 'NEST',
 'PGRD',
 'NTPC',
 'ONGC',
 'SBIL',
 'SRTR',
 'SBI',
 'RELI',
 'TISC',
 'SUN',
 'TCS',
 'TEML',
 'TACN',
 'TAMO',
 'TITN',
 'TREN',
 'ULTC',
 'WIPR',
 'ZOM',
 'JIO']
# Get all tickers of an Index
ttp.get_all_constituents_of_index('.NIFTY500')
_id	sid	ticker	name	sector	lastPrice	pr1d	slug	freeFloat	type
0	5f6c78c9896509a8eb2f90c2	TMIN	3MINDIA	3M India Ltd	Industrials	28945.00	0.783426	/stocks/3m-india-TMIN	0.264957	stock
1	5f6c78c9896509a8eb2f90d4	ARTI	AARTIIND	Aarti Industries Ltd	Materials	476.55	-0.604860	/stocks/aarti-industries-ARTI	20.812067	stock
2	5f6c78c9896509a8eb2f90e0	ABB	ABB	ABB India Ltd	Industrials	5862.00	-0.161799	/stocks/abb-india-ABB	5.297709	stock
3	5f6c78c9896509a8eb2f90e2	ABOT	ABBOTINDIA	Abbott India Ltd	Health Care	34735.00	-1.933936	/stocks/abbott-india-ABOT	0.520301	stock
4	5f6c78c9896509a8eb2f90dc	AVAS	AAVAS	Aavas Financiers Ltd	Financials	1910.00	-1.602184	/stocks/aavas-financiers-AVAS	4.039968	stock
...	...	...	...	...	...	...	...	...	...	...
496	66d909a3975eb0b59d34cd84	RAYM	RAYMONDLSL	Raymond Lifestyle Ltd	Consumer Discretionary	1283.60	3.449387	/stocks/raymond-lifestyle-RAYM	2.493451	stock
497	67340123e3379ce89f400eef	SWIG	SWIGGY	Swiggy Ltd	Communication Services	383.50	-0.647668	/stocks/swiggy-SWIG	88.101082	stock
498	671c4621a1910176b1728ecd	WAARE	WAAREEENER	Waaree Energies Ltd	Industrials	2978.10	-0.494504	/stocks/waaree-energies-WAARE	6.341399	stock
499	67340123e3379ce89f400eeb	ACMES	ACMESOLAR	ACME Solar Holdings Ltd	Utilities	249.57	-0.052062	/stocks/acme-solar-holdings-ACMES	10.035392	stock
500	685f45a3552c5a7d166f4fdc	RAYMO	RAYMONDREL	Raymond Realty Ltd	Real Estate	926.20	4.999433	/stocks/raymond-realty-RAYMO	NaN	stock
501 rows × 10 columns

Annual Report/ Quarterly Results extracted data
some params meanings
time_horizon -> result time period (annual / interim (quarterly) ) time_period -> count of records required (any integer (less than 20)) view_type -> normal - just show the numbers as is, growth - what is the % of increase happened compared to last entry (either Annually or Quarterly)

ttp.get_income_data('ADAI') # time_horizon = interim (quarterly), time_periods = 10 (10 qtrs), view = Normal
displayPeriod	endDate	reporting	qIncTrev	qIncRaw	qIncPfc	qIncEpc	qIncSga	qIncOpe	qIncEbi	qIncDep	qIncPbi	qIncIoi	qIncPbt	qIncToi	qIncNinc	qIncEps	qIncDps	qIncPyr
0	DEC 2022	2022-12-31T00:00:00.000Z	consolidated	3781.94	None	None	None	None	2074.16	1707.78	410.37	1297.41	697.09	600.32	125.60	474.72	4.26	None	None
1	MAR 2023	2023-03-31T00:00:00.000Z	consolidated	3860.12	None	None	None	None	2154.46	1705.66	415.55	1290.11	630.49	659.62	270.17	389.45	3.49	None	None
2	JUN 2023	2023-06-30T00:00:00.000Z	consolidated	3772.25	None	None	None	None	2394.61	1377.64	418.88	958.76	615.67	343.09	168.03	175.06	1.57	None	None
3	SEP 2023	2023-09-30T00:00:00.000Z	consolidated	3766.46	None	None	None	None	2323.73	1442.73	432.05	1010.68	640.81	369.87	93.99	275.88	2.47	None	None
4	DEC 2023	2023-12-31T00:00:00.000Z	consolidated	4824.42	None	None	None	None	3092.09	1732.33	457.64	1274.69	760.04	514.65	189.75	324.90	2.92	None	None
5	MAR 2024	2024-03-31T00:00:00.000Z	consolidated	4910.78	None	None	None	None	3141.33	1769.45	467.51	1301.94	749.99	551.95	190.51	361.44	3.24	None	None
6	JUN 2024	2024-06-30T00:00:00.000Z	consolidated	5489.97	None	None	None	None	5233.89	256.08	497.85	-241.77	810.93	-1052.70	-228.78	-823.92	-7.39	None	None
7	SEP 2024	2024-09-30T00:00:00.000Z	consolidated	6359.80	None	None	None	None	4468.56	1891.24	484.07	1407.17	812.94	594.23	-80.73	674.96	6.09	None	None
8	DEC 2024	2024-12-31T00:00:00.000Z	consolidated	6000.39	None	None	None	None	4169.52	1830.87	462.38	1368.49	809.12	559.37	-2.41	561.78	4.85	None	None
9	MAR 2025	2025-03-31T00:00:00.000Z	consolidated	6596.39	None	None	None	None	4334.62	2261.77	461.65	1800.12	826.17	973.95	326.80	647.15	5.50	None	None
ttp.get_income_data('ACC', time_horizon='annual', view_type='growth', num_time_periods=12)
incTrev	incCrev	incGpro	incOpc	incRaw	incPfc	incEpc	incSga	incOpe	incEbi	...	incIoi	incPbt	incToi	incNinc	incEps	incDps	incPyr	displayPeriod	reporting	endDate
0	22568.220000	NaN	NaN	NaN	5646.910000	5742.720000	1036.200000	6208.850000	1812.340000	2.121200e+03	...	77.280000	1.202600e+03	3.175300e+02	8.850700e+02	4.698471e+01	9.250000	1.968726e-01	FY 2023	consolidated	NaN
1	-8.303579	NaN	NaN	NaN	7.106187	-30.294355	-28.855433	-17.231855	-46.482448	7.900198e+01	...	100.025880	1.292832e+02	3.303940e+01	1.638119e+02	1.638119e+02	-18.918919	-6.926557e+01	FY '23 - FY '24	NaN	NaN
2	10.838808	NaN	NaN	NaN	33.909484	-12.430427	-2.638361	1.914788	17.673623	1.157022e+01	...	-29.990943	1.339760e+01	7.154152e+01	2.878043e+00	2.878043e+00	0.000000	-2.797529e+00	FY '24 - FY '25	NaN	NaN
3	0.154072	NaN	NaN	NaN	NaN	NaN	NaN	NaN	0.188974	-8.587612e-14	...	0.000000	-1.163490e-13	-1.568830e-14	-1.514487e-13	-1.448738e-13	0.000000	1.415741e-13	TTM		
4 rows × 22 columns

ttp.get_balance_sheet_data('ARTI', num_time_periods=16, growth=True)
balCsti	balTrec	balTinv	balOca	balTca	balNetl	balNppe	balGint	balLti	balOtha	...	balTeq	balTlse	balTcso	balTpso	balNca	balCa	balNcl	balDta	displayPeriod	reporting
0	33.710000	438.980000	551.730000	173.240000	1197.660000	None	1159.900000	0.000000	139.200000	441.060000	...	1022.270000	2937.820000	42.394489	None	1740.160000	1197.660000	827.750000	NaN	FY 2015	consolidated
1	-14.001780	19.230944	-10.247766	7.602170	3.033415	None	34.369342	NaN	-70.359195	-70.013150	...	16.347932	0.975553	-5.950111	None	-0.440764	3.033415	-20.990637	NaN	FY '15 - FY '16	NaN
2	-1.690238	0.242644	15.392072	3.326002	6.742356	None	26.041513	404.761905	13.814833	27.294723	...	19.920295	17.952927	-1.440224	None	25.937812	6.742356	15.035168	NaN	FY '16 - FY '17	NaN
3	12.631579	24.792727	30.781750	30.206116	27.919283	None	23.822808	-18.867925	0.553663	33.749109	...	16.064418	25.504351	-0.999000	None	24.046456	27.919283	52.815919	NaN	FY '17 - FY '18	NaN
4	2405.295950	18.524628	3.277131	-10.251605	52.949660	None	20.864989	-23.255814	-29.775519	36.082245	...	63.986831	33.393905	6.603502	None	21.219500	52.949660	5.338007	NaN	FY '18 - FY '19	NaN
5	-69.250187	-2.912221	8.278159	-25.155500	-22.204718	None	32.153596	-30.303030	11.610374	32.000783	...	13.212044	8.101141	-3.727968	None	31.906560	-22.204718	10.874035	NaN	FY '19 - FY '20	NaN
6	66.735412	5.347473	11.966303	34.079307	18.092445	None	25.871961	-89.130435	71.629289	-20.870726	...	14.373379	20.673983	0.000000	None	21.869938	18.092445	28.572918	NaN	FY '20 - FY '21	NaN
7	-57.906480	37.517796	-0.166724	121.202462	13.990117	None	1.027525	-100.000000	-55.462846	-51.513731	...	28.492749	2.735132	4.029005	None	-2.317371	13.990117	-32.325070	NaN	FY '21 - FY '22	NaN
8	15.654529	-13.836668	10.376611	-42.557493	-8.876439	None	20.574865	NaN	-39.307176	-39.100458	...	8.946797	9.301221	-12.727019	None	18.823687	-8.876439	-24.955064	90.266763	FY '22 - FY '23	NaN
9	-35.370896	-12.136227	12.472722	23.055749	0.391580	None	15.355781	NaN	33.488643	7.607661	...	7.512600	12.057127	0.000000	None	16.743580	0.391580	99.436575	171.978022	FY '23 - FY '24	NaN
10 rows × 35 columns

ttp.get_balance_sheet_data('ALKY', num_time_periods=10) # View_type = Normal
displayPeriod	endDate	reporting	balCsti	balTrec	balTinv	balOca	balTca	balNetl	balNppe	...	balRtne	balOeq	balTeq	balTlse	balTcso	balTpso	balNca	balCa	balNcl	balDta
0	FY 2016	2016-03-31T00:00:00.000Z	standalone	4.27	90.30	63.16	26.08	183.81	None	202.9415	...	176.35	0.00	199.47	406.39	5.101048	None	222.58	183.81	75.97	None
1	FY 2017	2017-03-31T00:00:00.000Z	standalone	2.96	97.34	111.41	13.31	225.02	None	254.4792	...	222.45	0.00	245.57	512.21	5.099098	None	287.19	225.02	106.07	None
2	FY 2018	2018-03-31T00:00:00.000Z	standalone	3.23	123.78	85.18	26.19	238.38	None	373.2459	...	274.04	0.00	297.16	637.05	5.099098	None	398.67	238.38	160.35	None
3	FY 2019	2019-03-31T00:00:00.000Z	standalone	20.17	152.63	105.69	33.53	312.02	None	419.2659	...	341.88	0.00	365.00	748.51	5.099098	None	436.49	312.02	135.75	None
4	FY 2020	2020-03-31T00:00:00.000Z	standalone	32.26	164.22	83.67	14.00	294.15	None	468.0687	...	513.48	0.00	536.60	783.39	5.099098	None	489.24	294.15	92.98	None
5	FY 2021	2021-03-31T00:00:00.000Z	standalone	156.28	227.99	122.04	21.76	528.07	None	595.6700	...	767.86	0.12	792.45	1145.49	5.103178	None	617.42	528.07	71.10	None
6	FY 2022	2022-03-31T00:00:00.000Z	standalone	62.57	276.74	164.61	33.73	537.65	None	771.5900	...	963.33	0.00	989.80	1371.40	5.107245	None	833.75	537.65	53.60	None
7	FY 2023	2023-03-31T00:00:00.000Z	standalone	18.23	258.42	183.85	40.32	500.82	None	1071.1900	...	1140.06	0.00	1168.93	1592.09	5.110063	None	1091.27	500.82	68.80	None
8	FY 2024	2024-03-31T00:00:00.000Z	standalone	31.38	221.73	172.38	18.28	443.77	None	1124.8000	...	1236.62	0.00	1267.14	1584.04	5.112139	None	1140.27	443.77	89.05	None
9	FY 2025	2025-03-31T00:00:00.000Z	standalone	204.06	230.65	165.36	30.63	630.70	None	1096.4100	...	1370.90	0.00	1402.49	1789.44	5.113642	None	1158.74	630.70	141.23	None
10 rows × 36 columns

ttp.get_cash_flow_data('TCS', num_time_periods=10, growth=False) # these 2 are default values ideally no need to pass {num_time_periods=10, growth=False}
displayPeriod	endDate	reporting	cafCiwc	cafCfoa	cafCexp	cafCfia	cafTcdp	cafCffa	cafFee	cafNcic	cafFcf
0	FY 2016	2016-03-31T00:00:00.000Z	consolidated	-12522	19109	1987	-5010	9515	-9666	None	4433	17122
1	FY 2017	2017-03-31T00:00:00.000Z	consolidated	-8577	25223	1989	-16895	10973	-11026	None	-2698	23234
2	FY 2018	2018-03-31T00:00:00.000Z	consolidated	-7818	25067	1862	3104	10760	-26885	None	1286	23205
3	FY 2019	2019-03-31T00:00:00.000Z	consolidated	-12127	28593	2231	1645	11472	-27897	None	2341	26362
4	FY 2020	2020-03-31T00:00:00.000Z	consolidated	-10513	32369	3249	8968	37702	-39915	None	1422	29120
5	FY 2021	2021-03-31T00:00:00.000Z	consolidated	-8229	38802	3176	-7956	10907	-32634	None	-1788	35626
6	FY 2022	2022-03-31T00:00:00.000Z	consolidated	-14255	39949	2995	-738	13375	-33581	None	5630	36954
7	FY 2023	2023-03-31T00:00:00.000Z	consolidated	-17183	41965	3100	548	41410	-47878	None	-5365	38865
8	FY 2024	2024-03-31T00:00:00.000Z	consolidated	-19371	44338	2674	6091	25218	-48536	None	1893	41664
9	FY 2025	2025-03-31T00:00:00.000Z	consolidated	-18945	48908	3937	-2144	44962	-47438	None	-674	44971
Peers Comparison
comparison type is either valuation (default) or Technical

ttp.peers_comparison('TCS') # this comparison is based on valuation
name	ticker	sid	sector	slug	description	ratios_ttmPe	ratios_pbr	ratios_divDps	ratios_apef
0	Tata Consultancy Services Ltd	TCS	TCS	IT Services & Consulting	/stocks/tata-consultancy-services-TCS	Tata Consultancy Services Limited (TCS) is eng...	25.483772	12.919501	3.684426	25.483772
1	Infosys Ltd	INFY	INFY	IT Services & Consulting	/stocks/infosys-INFY	NaN	25.456042	7.068462	2.620194	25.456042
2	HCL Technologies Ltd	HCLTECH	HCLT	IT Services & Consulting	/stocks/hcl-technologies-HCLT	NaN	26.881954	6.848163	3.482548	26.871139
3	Wipro Ltd	WIPRO	WIPR	IT Services & Consulting	/stocks/wipro-WIPR	NaN	21.526462	3.404897	2.222136	21.526462
4	Tech Mahindra Ltd	TECHM	TEML	IT Services & Consulting	/stocks/tech-mahindra-TEML	NaN	38.124096	5.832122	1.637586	38.124096
ttp.peers_comparison('TAMO', comparison_type='technical')
name	ticker	sid	sector	slug	description	ratios_12mVol	ratios_14dRsi
0	Tata Motors Ltd	TATAMOTORS	TAMO	Four Wheelers	/stocks/tata-motors-TAMO	Tata Motors Limited is an automobile company e...	31.914546	52.135231
1	Maruti Suzuki India Ltd	MARUTI	MRTI	Four Wheelers	/stocks/maruti-suzuki-india-MRTI	NaN	23.073493	53.994490
2	Mahindra and Mahindra Ltd	M&M	MAHM	Four Wheelers	/stocks/mahindra-and-mahindra-MAHM	NaN	30.694701	67.560051
3	Hyundai Motor India Ltd	HYUNDAI	HYU	Four Wheelers	/stocks/hyundai-motor-india-HYU	NaN	30.121382	61.010065
4	Force Motors Ltd	FORCEMOT	FORC	Four Wheelers	/stocks/force-motors-FORC	NaN	52.818234	53.339176
TickerTape SCORE CARD
ttp.get_score_card('INFY')
name	tag	type	description	colour	rank	peers	locked	callout	comment	stack	elements	score_percentage	score_max	score_value	score_key	score
0	Performance	Low	score	Hasn't fared well - amongst the low performers	red	None	None	True	None	None	1	[]	False	10.0	NaN	Performance	NaN
1	Valuation	High	score	Seems to be overvalued vs the market average	red	None	None	True	None	None	2	[]	False	10.0	NaN	Valuation	NaN
2	Growth	Low	score	Lagging behind the market in financials growth	red	None	None	True	None	None	3	[]	False	10.0	NaN	Growth	NaN
3	Profitability	High	score	Showing good signs of profitability & efficiency	green	None	None	True	None	None	4	[]	False	10.0	NaN	Profitability	NaN
4	Entry point	Avg	entryPoint	The stock is overpriced but is not in the over...	yellow	None	None	False	None	None	5	[{'title': 'Fundamentals', 'type': 'flag', 'de...	NaN	NaN	NaN	NaN	NaN
5	Red flags	Low	redFlag	No red flag found	green	None	None	False	None	None	6	[{'title': 'ASM', 'type': 'flag', 'description...	NaN	NaN	NaN	NaN	NaN
Share Holding Pattern Q-O-Q
_, raw_data = ttp.get_ticker('Tata consult') # TCS
slug_url = raw_data[0].get('slug')
print(slug_url)
ttp.get_share_holding_pattern(slug_url)
/stocks/tata-consultancy-services-TCS
date	data_pmPctT	data_pmPctP	data_plPctT	data_uPlPctT	data_mfPctT	data_isPctT	data_diPctT	data_othDiPctT	data_othExInsDiPctT	data_fiPctT	data_rhPctT	data_othPctT	data_rOthPctT
0	2023-12-31T00:00:00.000Z	72.412804	0.482187	0.349165	72.063639	3.508293	5.917744	10.088976	6.580683	0.662940	12.469608	4.188144	0.840468	5.028612
1	2024-03-31T00:00:00.000Z	71.766054	0.275750	0.197895	71.568159	4.051627	5.977892	10.668815	6.617188	0.639296	12.699170	4.047523	0.818438	4.865961
2	2024-06-30T00:00:00.000Z	71.766054	0.275750	0.197895	71.568159	4.249089	6.127442	11.057136	6.808047	0.680605	12.356210	4.029737	0.790864	4.820600
3	2024-09-30T00:00:00.000Z	71.766054	0.275750	0.197895	71.568159	4.248089	5.960481	10.911053	6.662963	0.702482	12.657080	3.888777	0.777037	4.665814
4	2024-12-31T00:00:00.000Z	71.766054	0.000000	0.000000	71.766054	4.320917	5.829444	10.913906	6.592989	0.763545	12.683564	3.863044	0.773432	4.636476
5	2025-03-31T00:00:00.000Z	71.766054	0.000000	0.000000	71.766054	5.001499	5.750555	11.557943	6.556445	0.805890	12.037838	3.864876	0.773289	4.638165
Mutual Funds Holdings of an Equity
_, raw_data = ttp.get_ticker('tata consumer')
slug_url = raw_data[0].get('slug')
print(slug_url)
ttp.get_mutual_fund_holdings(slug_url)
/stocks/tata-consumer-products-TACN
marketCapPct	change3m	currentRank	prevRank	securities	weight	meta_mfId	meta_isin	meta_slug	meta_name	meta_fullName	meta_option
0	0.518724	0.046314	22	22	49	1.483037	M_HDCTP	INF179K01YV8	/mutualfunds/hdfc-large-cap-fund-M_HDCTP	HDFC Large Cap Fund	HDFC Large Cap Fund - Growth - Direct Plan	Growth
1	0.482421	-0.139834	12	11	119	2.073103	M_CAOP	INF760K01EI4	/mutualfunds/canara-rob-large-and-mid-cap-fund...	Canara Rob Large and Mid Cap Fund	Canara Robeco Large and Mid Cap Fund - Growth ...	Growth
2	0.412170	0.347363	122	130	230	0.659778	M_KOQU	INF174K01LC6	/mutualfunds/kotak-arbitrage-fund-M_KOQU	Kotak Arbitrage Fund	Kotak Arbitrage Fund - Growth - Direct Plan	Growth
3	0.375371	-0.060692	44	75	251	0.642408	M_NIMS	INF204K01K15	/mutualfunds/nippon-india-small-cap-fund-M_NIMS	Nippon India Small Cap Fund	Nippon India Small Cap Fund - Growth - Direct ...	Growth
4	0.369744	-0.060210	36	31	77	0.954950	M_NIGE	INF204K01XI3	/mutualfunds/nippon-india-large-cap-fund-M_NIGE	Nippon India Large Cap Fund	Nippon India Large Cap Fund - Growth - Direct ...	Growth
SmallCase Holdings of an Equity
_, raw_data = ttp.get_ticker('Infosys')
slug_url = raw_data[0].get('slug')
print(slug_url)
ttp.get_smallcase_holdings(slug_url)
/stocks/infosys-INFY
scid	name	description	publisherName	slug	iconUrl	cagr	weight	publisher	minInvestmentAmount
0	SCTR_0006	IT Tracker	Companies to efficiently track and invest in t...	Windmill Capital	/smallcase/it-tracker-SCTR_0006	https://assets.smallcase.com/images/smallcases...	25.065102	0.115619	smallcaseHQ	82781
1	SCMO_0014	Dividend Aristocrats Model	Companies that have been consistently increasi...	Windmill Capital	/smallcase/dividend-aristocrats-SCMO_0014	https://assets.smallcase.com/images/smallcases...	12.508054	0.083333	smallcaseHQ	71769
Dividends History of an Equity this will provide history as well as confirmed upcoming
_, raw_data = ttp.get_ticker('ITC ltd')
slug_url = raw_data[0].get('slug')
print(slug_url)
ttp.get_dividends_history(slug_url)
/stocks/itc-ITC
_id	description	dividend	exDate	sid	type	title	subType	value	ticker
0	682fc0a3e1eaebd3fa7e7256	Final|7.85	7.850000	2025-05-28T00:00:00.000Z	ITC	cashDividend	Cash Dividend	Final	7.85	ITC
1	67a6a49b1ba432b32509b205	Interim|6.5	6.500000	2025-02-12T00:00:00.000Z	ITC	cashDividend	Cash Dividend	Interim	6.5	ITC
2	665a6dfe05bb6ca068f1f359	Final|7.5	7.095100	2024-06-04T00:00:00.000Z	ITC	cashDividend	Cash Dividend	Final	7.5	ITC
3	65b997d88a2dd7eecd38ac4d	Interim|6.25	5.912583	2024-02-08T00:00:00.000Z	ITC	cashDividend	Cash Dividend	Interim	6.25	ITC
4	646c0b7999f7f66b45caa04a	Final|6.75	6.385590	2023-05-30T00:00:00.000Z	ITC	cashDividend	Cash Dividend	Final	6.75	ITC
5	646c0b7999f7f66b45caa04c	Special|2.75	2.601537	2023-05-30T00:00:00.000Z	ITC	cashDividend	Cash Dividend	Special	2.75	ITC
Key Ratios of a stock or Index
_, raw_data = ttp.get_ticker('Adani Ports')
slug_url = raw_data[0].get('slug')
print(slug_url)
ttp.get_key_ratios(slug_url)
/stocks/adani-ports-and-special-economic-zone-APSE
0
risk	2.423019
3mAvgVol	2981027.540984
4wpct	-0.20919
52wHigh	1604.95
52wLow	995.65
52wpct	-5.270508
beta	1.444212
bps	301.474681
divYield	0.491435
eps	51.349984
inddy	0.553397
indpb	6.48069
indpe	38.900817
marketCap	307690.191326
mrktCapRank	26
pb	4.724775
pe	27.739054
roe	18.517619
nShareholders	1262911
lastPrice	1424.4
ttmPe	27.739054
marketCapLabel	Largecap
12mVol	33.545846
mrktCapf	307690.191326
apef	27.739054
pbr	4.724775
etfLiq	0.024905
etfLiqLabel	High
_, raw_data = ttp.get_ticker('NIFTY 50')
slug_url = raw_data[0].get('slug')
print(slug_url)
ttp.get_key_ratios(slug_url)
/indices/nifty-50-index-.NSEI
0
marketCapLabel	Largecap
52wpct	4.757732
4wpct	3.43988
52wHigh	26277.35
52wLow	21743.65
divYield	1.307708
pb	3.500254
pe	23.147277
5yYldAvg	1.361877
sharpeRatio	1.054187
constituentsCount	50
etfsCount	21
marketCap	20193102.000365
marketCapShare	43.419195
risk	1
12mVol	13.891436
lastPrice	25461
3Ypct	60.785837
5Ypct	136.546153
13wpct	11.161805
26wpct	7.812272
pr1w	-0.669947
All ETFs under an Index
ttp.get_all_etfs_under_index('.NSEI')
sid	stock_advancedRatios_etfLiq	stock_advancedRatios_etfLiqLabel	stock_advancedRatios_expenseRatio	stock_advancedRatios_trackErr	stock_info_sector	stock_info_name	stock_info_ticker	stock_info_exchange	stock_info_amc	stock_info_amcDesc	stock_info_description	stock_info_trIndex	stock_info_trIndexName	stock_info_trIndexSlug	stock_info_amcCode	stock_slug
0	NBES	0.047571	High	0.0400	0.019049	Equity	Nippon India ETF Nifty 50 BeES	NIFTYBEES	NSE	Nippon Life India Asset Management Limited	Nippon India Mutual Fund is one of India’s lea...	NIPPON INDIA ETF Nifty BeES objective is to pr...	.NSEI	Nifty 50 Index	/indices/nifty-50-index-.NSEI	RMF	/etfs/nippon-india-nifty-50-bees-etf-NBES
1	SBFP	0.275650	High	0.0400	0.014287	Equity	SBI Nifty 50 ETF	SETFNIF50	NSE	SBI Funds Management Limited	With 30 years of rich experience in fund manag...	SBI-ETF Nifty 50 objective is to provide retur...	.NSEI	Nifty 50 Index	/indices/nifty-50-index-.NSEI	L	/etfs/sbi-nifty-50-etf-SBFP
2	ICNI	0.414968	High	0.0259	0.014287	Equity	ICICI Prudential Nifty 50 ETF	NIFTYIETF	NSE	ICICI Prudential Asset Management Company Limited	ICICI Prudential Asset Management Company Ltd....	ICICI Prudential Nifty iWIN ETF objective is t...	.NSEI	Nifty 50 Index	/indices/nifty-50-index-.NSEI	P	/etfs/icici-prudential-nifty-50-etf-ICNI
3	UTIN	0.419459	High	0.0500	0.015875	Equity	UTI Nifty 50 ETF	UTINIFTETF	NSE	UTI Asset Management Company Private Limited	UTI AMC commenced operations from February 1, ...	UTI-Nifty ETF objective is to provide returns ...	.NSEI	Nifty 50 Index	/indices/nifty-50-index-.NSEI	108	/etfs/uti-nifty-50-etf-UTIN
4	MIRA	1.424179	High	0.0400	0.014287	Equity	Mirae Asset Nifty 50 ETF	NIFTYETF	NSE	Mirae Asset Investment Managers (India) Privat...	Mirae Asset Financial Group is one of the key ...	Mirae Asset Nifty 50 ETF objective is to gener...	.NSEI	Nifty 50 Index	/indices/nifty-50-index-.NSEI	MAF	/etfs/mirae-asset-nifty-50-etf-MIRA
5	HDFN	2.332681	High	0.0500	0.012700	Equity	HDFC Nifty 50 ETF	HDFCNIFTY	NSE	HDFC Asset Management Company Limited	HDFC Asset Management Company, investment mana...	HDFC Nifty ETF-Growth objective is to provide ...	.NSEI	Nifty 50 Index	/indices/nifty-50-index-.NSEI	H	/etfs/hdfc-nifty-50-etf-HDFN
6	ADIY	2.402481	High	0.0400	0.025399	Equity	Aditya BSL Nifty 50 ETF	BSLNIFTY	NSE	Aditya Birla Sun Life AMC Limited	Aditya Birla Sun Life AMC Limited, is a joint ...	Aditya BSL Nifty ETF objective is to provide r...	.NSEI	Nifty 50 Index	/indices/nifty-50-index-.NSEI	B	/etfs/aditya-bsl-nifty-50-etf-ADIY
7	KOTK	3.399428	High	0.0400	0.017462	Equity	Kotak Nifty 50 ETF	NIFTY1	NSE	Kotak Mahindra Asset Management Company Limited	Kotak Mahindra Asset Management Company Limite...	Kotak Nifty ETF objective is to provide return...	.NSEI	Nifty 50 Index	/indices/nifty-50-index-.NSEI	K	/etfs/kotak-nifty-50-etf-KOTK
8	NIFT	11.761306	High	0.0700	0.022224	Equity	Bajaj Finserv Nifty 50 ETF	NIFTYBETF	NSE	Bajaj Finserv Asset Management Limited	NaN	Bajaj Finserv Nifty 50 ETF seeks to replicate ...	.NSEI	Nifty 50 Index	/indices/nifty-50-index-.NSEI	189	/etfs/bajaj-finserv-nifty-50-etf-NIFT
9	DSPN	19.741488	High	0.0600	0.017462	Equity	DSP Nifty 50 ETF	NIFTY50ADD	NSE	DSP Investment Managers Private Limited	DSP Investment Managers is an independent Indi...	DSP Nifty 50 ETF objective is to provide retur...	.NSEI	Nifty 50 Index	/indices/nifty-50-index-.NSEI	D	/etfs/dsp-nifty-50-etf-DSPN
10	AISN	23.786862	Medium	0.0400	0.025399	Equity	Axis Nifty 50 ETF	AXISNIFTY	NSE	Axis Asset Management Company Ltd.	Axis Asset Management Company Ltd. is the mutu...	Axis Nifty ETF objective is to provide returns...	.NSEI	Nifty 50 Index	/indices/nifty-50-index-.NSEI	128	/etfs/axis-nifty-50-etf-AISN
11	AONEN	34.252864	Medium	0.0900	NaN	Equity	Angel One Nifty 50 ETF	AONENIFTY	NSE	Angel One Asset Management Company Ltd.	NaN	Angel One Nifty 50 ETF's objective is to provi...	.NSEI	Nifty 50 Index	/indices/nifty-50-index-.NSEI	AO	/etfs/angel-one-nifty-50-etf-AONEN
12	QUAN	49.843477	Medium	0.0900	0.022224	Equity	Quantum Nifty 50 ETF	QNIFTY	NSE	Quantum Asset Management Company Private Limited	Quantum Asset Management Company Pvt Ltd. is t...	Quantum Nifty ETF objective is to invest in st...	.NSEI	Nifty 50 Index	/indices/nifty-50-index-.NSEI	QMF	/etfs/quantum-nifty-50-etf-QUAN
13	LICO	52.935777	Medium	0.0600	0.028574	Equity	LIC MF Nifty 50 ETF	LICNETFN50	NSE	LIC Mutual Fund Asset Management Limited	LIC Mutual Fund was established on 20th April ...	LIC MF ETF-Nifty 50 objective is to provide re...	.NSEI	Nifty 50 Index	/indices/nifty-50-index-.NSEI	LIC	/etfs/lic-mf-nifty-50-etf-LICO
14	M50	61.405276	Medium	0.0600	0.017462	Equity	Motilal Oswal M50 ETF	MOM50	NSE	Motilal Oswal Asset Management Company Limited	Motilal Oswal Asset Management Company Ltd. (M...	Motilal Oswal MOSt Shares M50 ETF objective is...	.NSEI	Nifty 50 Index	/indices/nifty-50-index-.NSEI	127	/etfs/motilal-oswal-nifty-50-etf-M50
15	TATN	68.848342	Medium	0.0600	0.165095	Equity	Tata Nifty 50 ETF	NETF	NSE	Tata Asset Management Private Limited	Established in 1994, Tata Asset Management Pri...	Tata Nifty ETF objective of the scheme is to p...	.NSEI	Nifty 50 Index	/indices/nifty-50-index-.NSEI	T	/etfs/tata-nifty-50-etf-TATN
16	IFCN	114.376069	Low	0.0900	0.033336	Equity	IDFC Nifty 50 ETF	IDFNIFTYET	NSE	Bandhan AMC Limited	IDFC AMC Limited is a subsidiary of the IDFC F...	The fund seeks to provide returns that, before...	.NSEI	Nifty 50 Index	/indices/nifty-50-index-.NSEI	G	/etfs/idfc-nifty-50-etf-IFCN
17	INVO	574.624379	Low	0.1000	0.023812	Equity	Invesco India Nifty 50 ETF	IVZINNIFTY	NSE	Invesco Asset Management Company Pvt Ltd.	Invesco is an independent investment managemen...	Invesco India Nifty ETF objective is to provid...	.NSEI	Nifty 50 Index	/indices/nifty-50-index-.NSEI	120	/etfs/invesco-india-nifty-50-etf-INVO
18	IDTI	NaN	Low	0.5200	1.054067	Equity	Indiabulls NIFTY50 Exchange Traded Fund	IBMFNIFTY	NSE	Groww Asset Management Limited	Indiabulls Housing Finance Limited ("IHFL") is...	Indiabulls Nifty50 ETF objective is to provide...	.NSEI	Nifty 50 Index	/indices/nifty-50-index-.NSEI	125	/etfs/indiabulls-nifty-50-etf-IDTI
19	EETS	NaN	Low	0.0700	2.241481	Equity	Edelweiss Nifty 50 ETF	NIFTYEES	NSE	Edelweiss Asset Management Limited	Edelweiss Asset Management Limited (EAML) is p...	Edelweiss ETF-Nifty 50 objective is to provide...	.NSEI	Nifty 50 Index	/indices/nifty-50-index-.NSEI	EMF	/etfs/edelweiss-nifty-50-etf-EETS
20	NAVI	NaN	Low	0.0500	0.182557	Equity	Navi NIFTY 50 ETF	NAVINIFTY	NSE	Navi AMC Limited	NaN	Navi NIFTY 50 ETF seeks to replicate the retur...	.NSEI	Nifty 50 Index	/indices/nifty-50-index-.NSEI	PLF	/etfs/navi-nifty-50-etf-NAVI
Tickertape Filters or Screeners
You can pass any number of filters listed below, you can also pass entire filters list.
Sortby pass the filter name by default it considers the first entry in the filters list
In the number of records pass n records else it will give entire stocks list available in exchange (~4k stocks)
all_filters = ttp.get_equity_screener_all_filters()
all_filters
{'Market Cap': 'mrktCapf',
 'Sector': 'sector',
 'Sub-Sector': 'subindustry',
 'Close Price / 200D SMA': 'lastPrice,sma200d,/',
 'Close Price / 50D SMA': 'lastPrice,sma50d,/',
 '5Y Avg EBITDA Margin': 'opmg',
 'Return on Equity': 'roe',
 'EBITDA Margin': 'aopm',
 '5Y Avg Net Profit Margin': '5YpftMrg',
 'Return on Investment': 'aroi',
 '5Y Avg Return on Equity': '5Yroe',
 'Return on Assets': 'rtnAsts',
 '5Y Avg Return on Assets': '5YrtnAsts',
 'Net Profit Margin': 'pftMrg',
 '5Y Avg Return on Investment': '5Yaroi',
 '5Y Avg Cash Flow Margin': '5YcafCfoaMgn',
 'Cost of Goods Sold': 'balCogs',
 'Cash Flow Margin': 'cafCfoaMgn',
 'ROCE': 'roce',
 '1Y Hist Op. Cash Flow Growth': 'cfog',
 '1Y Historical EPS Growth': 'epsg',
 '1Y Historical Revenue Growth': 'rvng',
 '5Y Historical EBITDA Growth': 'earnings',
 '5Y Hist Op. Cash Flow Growth': 'cfotr',
 '3Y Historical Dividend Growth': '3YdivGwth',
 '5Y Historical EPS Growth': 'epsGwth',
 '5Y Historical Revenue Growth': '5YrevChg',
 '1Y Historical EBITDA Growth': 'ebitg',
 'PB Ratio': 'pbr',
 'PS Ratio': 'ps',
 'EV/EBITDA Ratio': 'evebitd',
 'PE Ratio': 'apef',
 'Dividend Yield': 'divDps',
 'EV / EBIT Ratio': 'evebit',
 'EV / Revenue Ratio': 'evByRev',
 'Price / Free Cash Flow': 'lcpCafFcf',
 'EV / Invested Capital': 'evByIc',
 'EV / Free Cash Flow': 'evCafFcf',
 'Enterprise Value': 'ev',
 'Price / CFO': 'priceCfoR',
 'Price / Sales': 'priceBySales',
 'Sector Dividend Yield': 'inddy',
 'Sector PB': 'indpb',
 'Sector PE': 'indpe',
 'TTM PE Ratio': 'ttmPe',
 'Mutual Fund Holding': 'instown',
 'Domestic Institutional Holding': 'domInstHldng',
 '\xa0MF Holding Change\xa0–\xa06M': 'chMutHldng6M',
 'Promoter Holding Change\xa0–\xa03M': 'strown3',
 'Foreign Institutional Holding': 'forInstHldng',
 'DII Holding Change\xa0–\xa06M': 'domInstHldng6M',
 'FII Holding Change\xa0–\xa06M': 'forInstHldng6M',
 'DII Holding Change\xa0–\xa03M': 'domInstHldng3M',
 'Promoter Holding Change\xa0–\xa06M\xa0': 'chPromHldng6M',
 'MF Holding Change\xa0–\xa03M': 'instown3',
 'Promoter Holding': 'strown',
 'Pledged Promoter Holdings': 'promShrPled',
 'FII Holding Change\xa0–\xa03M': 'forInstHldng3M',
 'Retail Investor Holding': 'retailHolding',
 'Insurance Firms Holding': 'insHolding',
 'No. of Shareholders': 'nShareholders',
 'Lot Size': 'ftls',
 'Future Close Price': 'ftcp',
 'Basis': 'ftbas',
 'Future Open Interest': 'ftoi',
 'Future Volume': 'ftvol',
 'Call Open Interest': 'opcoi',
 'Put Open Interest': 'oppoi',
 '1M Average Volume': 'vol1mAvg',
 '1M Return': '4wpct',
 'Daily Volume': 'acVol',
 '1Y Return vs Nifty': '12mpctN',
 'Close Price': 'lastPrice',
 '1M Return vs Nifty': '4wpctN',
 '1W Change in Volume': 'vol1wChPct',
 '3M Average Volume': 'vol3mAvg',
 '1W Return': 'pr1w',
 '6M Return vs Nifty': '6mpctN',
 '% Away From 52W High': '52whd',
 '1D Return': 'pr1d',
 '6M Return': '26wpct',
 '1Y Return': '52wpct',
 '1W Return vs Nifty': 'pr1wN',
 '1D Change in Volume': 'vol1dChPct',
 '% Away From 52W Low': '52wld',
 'Face value': 'faceValue',
 '5Y CAGR': '5yCagrPct',
 'Current Ratio': 'qcur',
 'Cash Conversion Cycle': 'ccnc',
 'Long Term Debt to Equity': 'ldbtEqt',
 'Interest Coverage Ratio': 'aint',
 'Debt to Equity': 'dbtEqt',
 'Quick Ratio': 'aqui',
 'Net Income / Liabilities': 'netIncByLbl',
 'Working Capital Turnover Ratio': 'wcTurnR',
 'Inventory Turnover Ratio': 'invTurnR',
 'Asset Turnover Ratio': 'asstTurnR',
 'Earning Power': 'erngPwrR',
 '% Price above 1M EMA': 'prAvMonthEVA',
 'Beta': 'beta',
 'Relative Volume': 'relVol',
 'Volatility': '12mVol',
 'VWAP': 'vWAP',
 '% Price above 1Y SMA': 'pab12Mma',
 'Alpha': '3Ywal',
 'Volatility vs Nifty': '12mVolN',
 '% Price above 1M SMA': 'pab1Mma',
 'Sharpe Ratio': '3Ywsh',
 '200D SMA': 'sma200d',
 '50D EMA': 'ema50d',
 '100D EMA': 'ema100d',
 '100D SMA': 'sma100d',
 '10D EMA': 'ema10d',
 '200D EMA': 'ema200d',
 '10D SMA': 'sma10d',
 '50D SMA': 'sma50d',
 '1Y Max Loss': 'maxDrawdown',
 'Additional Paid–in Capital': 'balApic',
 'Net Change in Cash': 'cafNcic',
 'Total Liabilities': 'balTotl',
 'Investing Cash Flow': 'cafCfia',
 'Loans & Advances': 'balNetl',
 'Financing Cash Flow': 'cafCffa',
 'Long Term Investments': 'balLti',
 'Total Cash Dividend Paid': 'cafTcdp',
 'Reserves & Surplus': 'balRtne',
 'Capital Expenditure': 'cafCexp',
 'Net Property,Plant & Equipment': 'balNppe',
 'Operating Cash Flow': 'cafCfoa',
 'Goodwill & Intangibles': 'balGint',
 'Total Current Assets': 'balTca',
 'Change in Working Capital': 'cafCiwc',
 'Total Debt': 'balTdeb',
 'Accounts Payable': 'balAccp',
 'Long Term Debt': 'balTltd',
 'Common Shares Outstanding': 'balTcso',
 'Deferred Tax Liabilities (Net)': 'balDit',
 'Total Equity': 'balTeq',
 'Total Receivables': 'balTrec',
 'Total Assets': 'balTota',
 'Total Current Liabilities': 'balTcl',
 'Minority Interest': 'balMint',
 'Share Capital': 'balComs',
 'Cash and Equivalent': 'balCsti',
 'Total Inventory': 'balTinv',
 'Total Deposits – Banks': 'balTdep',
 'Deferred Tax Assets (Net)': 'balDta',
 'Non Current Assets': 'balNca',
 'Free Cash Flow': 'cafFcf',
 'Non Current Liabilties': 'balNcl',
 'Book Value': 'bookValue',
 'Other Current Liabilities': 'balOcl',
 'Other Current Assets': 'balOca',
 'Other Liabilities': 'balOthl',
 'Other Assets': 'balOtha',
 'Expense Ratio': 'expenseRatio',
 'Tracking Error': 'trackErr',
 'EBITDA': 'incEbi',
 'Net Income': 'incNinc',
 'Payout Ratio': 'incPyr',
 'Earnings Per Share': 'incEps',
 'Taxes & Other Items': 'incToi',
 'Dividend Per Share': 'incDps',
 'PBIT': 'incPbi',
 'Interest & Other Items': 'incIoi',
 'Total Revenue': 'incTrev',
 'Depreciation & Amortization': 'incDep',
 'PBT': 'incPbt',
 'Power & Fuel Cost': 'incPfc',
 'Raw Materials': 'incRaw',
 'Operating & Other expenses': 'incOpe',
 'Employee Cost': 'incEpc',
 'Selling & Administrative Expenses': 'incSga',
 'Net Income (Q)': 'qIncNincK',
 'PBT (Q)': 'qIncPbtK',
 'Total revenue (Q)': 'qIncTrevK',
 'EPS (Q)': 'qIncEpsK',
 'EBITDA (Q)': 'qIncEbiK',
 'Operating and Other Expenses (Q)': 'qIncOpeK',
 'PBIT (Q)': 'qIncPbiK'}
filtered_list_df = ttp.get_equity_screener_data(filters=["mrktCapf", "lastPrice", "beta"], sortby='mrktCapf', number_of_records=20)
filtered_list_df.head()
slug	advancedRatios.lastPrice	advancedRatios.beta	advancedRatios.mrktCapf	info.name	info.ticker	info.sector	sid
0	/stocks/reliance-industries-RELI	1527.3	0.814289	2.066815e+06	Reliance Industries Ltd	RELIANCE	Energy	RELI
1	/stocks/hdfc-bank-HDBK	1989.3	1.057674	1.525375e+06	HDFC Bank Ltd	HDFCBANK	Financials	HDBK
2	/stocks/tata-consultancy-services-TCS	3419.8	0.753030	1.237314e+06	Tata Consultancy Services Ltd	TCS	Information Technology	TCS
3	/stocks/bharti-airtel-BRTI	2017.2	0.690940	1.209511e+06	Bharti Airtel Ltd	BHARTIARTL	Communication Services	BRTI
4	/stocks/icici-bank-ICBK	1442.8	1.180557	1.029103e+06	ICICI Bank Ltd	ICICIBANK	Financials	ICBK
ttp.get_income_data('INFY', time_horizon='annual', view_type='growth', num_time_periods=12)
incTrev	incCrev	incGpro	incOpc	incRaw	incPfc	incEpc	incSga	incOpe	incEbi	...	incIoi	incPbt	incToi	incNinc	incEps	incDps	incPyr	displayPeriod	reporting	endDate
0	65561.000000	NaN	NaN	NaN	0.0	217.000000	34406.000000	4450.000000	6289.000000	20199.000000	...	0.000000	18740.000000	5251.000000	13489.000000	29.508391	12.125000	0.410900	FY 2016	consolidated	NaN
1	9.110599	NaN	NaN	NaN	NaN	5.069124	9.454746	3.235955	17.649865	7.203327	...	NaN	6.462113	6.608265	6.405219	6.404426	6.185567	-0.205686	FY '16 - FY '17	NaN	NaN
2	3.213856	NaN	NaN	NaN	NaN	-9.210526	3.276773	0.000000	8.203811	2.212062	...	NaN	1.598917	-24.240800	11.677001	14.489829	68.932039	47.552005	FY '17 - FY '18	NaN	NaN
3	15.879078	NaN	NaN	NaN	NaN	6.763285	16.511969	21.049195	42.493130	4.152171	...	NaN	3.803651	32.916765	-3.899183	-1.294209	-1.149425	0.146682	FY '18 - FY '19	NaN	NaN
4	9.393738	NaN	NaN	NaN	NaN	3.619910	12.296149	-3.200863	5.408485	8.754121	...	NaN	4.591037	-3.973745	7.725266	9.055033	-18.604651	-25.363052	FY '19 - FY '20	NaN	NaN
5	9.700408	NaN	NaN	NaN	NaN	-37.554585	9.145754	-40.553595	13.920998	20.023933	...	14.705882	20.997864	34.435618	16.614439	17.862340	54.285714	30.903318	FY '20 - FY '21	NaN	NaN
6	20.709437	NaN	NaN	NaN	NaN	-7.692308	15.204984	34.875000	58.522520	12.283151	...	2.564103	13.076461	9.935413	14.257661	14.904093	14.814815	-0.077698	FY '21 - FY '22	NaN	NaN
7	20.600955	NaN	NaN	NaN	NaN	33.333333	22.462726	23.146432	27.956346	11.972415	...	42.000000	10.667552	15.337500	8.977838	10.400777	9.677419	-0.655211	FY '22 - FY '23	NaN	NaN
8	5.963149	NaN	NaN	NaN	NaN	13.068182	5.437793	7.638758	3.303703	8.736222	...	65.492958	8.000720	5.722337	8.873210	9.571232	35.294118	23.475949	FY '23 - FY '24	NaN	NaN
9	5.183071	NaN	NaN	NaN	NaN	11.557789	4.030501	5.873099	9.824072	4.132633	...	-11.489362	4.501501	11.686315	1.829756	1.741006	-6.521739	-8.121352	FY '24 - FY '25	NaN	NaN
10	-0.000600	NaN	NaN	NaN	NaN	NaN	NaN	NaN	0.000808	-0.004669	...	0.000000	-0.002659	-0.009179	0.000000	-0.044127	13.953488	14.003795	TTM		
11 rows × 22 columns

ttp.get_balance_sheet_data('INFY', num_time_periods=16, growth=True)
balCsti	balTrec	balTinv	balOca	balTca	balNetl	balNppe	balGint	balLti	balOtha	...	balTeq	balTlse	balTcso	balTpso	balNca	balCa	balNcl	balDta	displayPeriod	reporting
0	32772.000000	11330.000000	0.0	7651.000000	51753.000000	None	10527.000000	3819.000000	1817.000000	6898.000000	...	61744.000000	75098.000000	457.124218	None	23345.000000	51753.000000	115.000000	284.000000	FY 2016	consolidated
1	-0.540095	8.755516	NaN	14.860803	3.771762	None	12.577182	-3.299293	255.145845	3.116845	...	11.722597	10.719327	0.001490	None	26.121225	3.771762	33.043478	17.253521	FY '16 - FY '17	NaN
2	-19.542875	6.654764	NaN	21.187984	-6.867145	None	0.877563	-39.750880	-10.801178	21.678617	...	-5.882694	-4.568961	-4.915127	None	-0.377000	-6.867145	109.150327	122.522523	FY '17 - FY '18	NaN
3	-0.114395	12.821488	NaN	11.323944	5.720055	None	12.948557	61.573034	-19.492703	1.166956	...	0.126302	5.944624	-0.245481	None	6.327560	5.720055	31.875000	-5.533063	FY '18 - FY '19	NaN
4	-11.036457	24.684697	NaN	7.835695	3.211165	None	42.797897	51.905424	-10.725076	-13.567839	...	1.289112	9.199914	-2.195624	None	19.353598	3.211165	1108.530806	10.857143	FY '19 - FY '20	NaN
5	16.100240	4.365230	NaN	12.499022	11.281516	None	4.522352	14.869072	186.753686	9.209831	...	16.611992	17.114379	0.103588	None	25.666237	11.281516	34.588235	-71.262887	FY '20 - FY '21	NaN
6	-10.759166	17.642791	NaN	41.430856	10.623549	None	-1.443882	1.275307	15.072073	16.406534	...	-1.362298	8.574006	-1.228066	None	5.913036	10.623549	7.663170	-74.887892	FY '21 - FY '22	NaN
7	-20.969145	12.009869	NaN	29.657851	5.501228	None	11.332629	16.464662	-7.926159	-33.478848	...	0.077902	6.739542	-1.350461	None	8.418779	5.501228	30.108254	9244.642857	FY '22 - FY '23	NaN
8	45.168221	18.757867	NaN	19.575355	26.172035	None	-7.307588	0.243276	-6.850187	29.765625	...	16.710865	10.244310	0.086131	None	-10.773527	26.172035	5.096204	NaN	FY '23 - FY '24	NaN
9	33.341757	3.196105	NaN	-8.034752	8.572994	None	4.600449	39.328570	-5.543218	-5.334136	...	8.751879	7.596826	0.088332	None	5.775330	8.572994	-13.488372	NaN	FY '24 - FY '25	NaN
10 rows × 35 columns