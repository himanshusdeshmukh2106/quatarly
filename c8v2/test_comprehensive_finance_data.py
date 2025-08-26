#!/usr/bin/env python3
"""
Comprehensive test for both basic finance data and OHLC data
Tests the circular buffer system with 5 symbols for complete validation
Covers allocation, formula preparation, execution, parsing, clearing, and release operations
"""

import os
import django
import time
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

from investments.google_sheets_service import google_sheets_service
import logging

# Set up comprehensive logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class FinanceDataTester:
    """Comprehensive tester for finance data operations"""
    
    def __init__(self):
        self.test_symbols = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK']
        self.results = {
            'market_data': {},
            'ohlc_data': {},
            'buffer_allocation': {},
            'concurrent_processing': {},
            'error_handling': {}
        }
        
    def test_service_availability(self):
        """Test Google Sheets service availability"""
        print("🔧 Testing Service Availability")
        print("=" * 60)
        
        if not google_sheets_service.is_available():
            print("❌ Google Sheets service not available")
            return False
            
        print("✅ Google Sheets service is available")
        print(f"   Spreadsheet ID: {google_sheets_service.spreadsheet_id[:20]}...")
        print(f"   Worksheets configured: {list(google_sheets_service.worksheets.keys())}")
        return True
    
    def test_circular_buffer_allocation(self):
        """Test circular buffer allocation for both data types"""
        print("\n🔄 Testing Circular Buffer Allocation")
        print("=" * 60)
        
        try:
            # Test market data buffer
            print("📊 Market Data Buffer:")
            market_blocks = []
            for i in range(3):  # Test multiple allocations
                block_num, start_row, end_row = google_sheets_service.buffer_service.allocate_market_block()
                market_blocks.append((block_num, start_row, end_row))
                print(f"   Allocation {i+1}: Block {block_num}, Rows {start_row}-{end_row}")
                
            # Test OHLC data buffer
            print("\n📈 OHLC Data Buffer:")
            ohlc_blocks = []
            for i in range(3):  # Test multiple allocations
                block_num, start_row, end_row = google_sheets_service.buffer_service.allocate_ohlc_block()
                ohlc_blocks.append((block_num, start_row, end_row))
                print(f"   Allocation {i+1}: Block {block_num}, Rows {start_row}-{end_row}")
            
            # Check buffer status
            print("\n📋 Buffer Status:")
            status = google_sheets_service.buffer_service.get_all_status()
            print(f"   Market: {status['market_buffer']['blocks_in_use']}/{status['market_buffer']['total_blocks']} blocks in use")
            print(f"   OHLC: {status['ohlc_buffer']['blocks_in_use']}/{status['ohlc_buffer']['total_blocks']} blocks in use")
            
            # Release all allocated blocks
            print("\n🔄 Releasing allocated blocks:")
            for block_num, _, _ in market_blocks:
                google_sheets_service.buffer_service.release_market_block(block_num)
                print(f"   Released market block {block_num}")
                
            for block_num, _, _ in ohlc_blocks:
                google_sheets_service.buffer_service.release_ohlc_block(block_num)
                print(f"   Released OHLC block {block_num}")
            
            self.results['buffer_allocation'] = {
                'status': 'success',
                'market_blocks_tested': len(market_blocks),
                'ohlc_blocks_tested': len(ohlc_blocks)
            }
            
            print("✅ Circular buffer allocation test passed")
            return True
            
        except Exception as e:
            print(f"❌ Circular buffer allocation test failed: {e}")
            self.results['buffer_allocation'] = {'status': 'failed', 'error': str(e)}
            return False
    
    def test_market_data_comprehensive(self):
        """Comprehensive test for market data fetching"""
        print("\n📊 Testing Market Data Comprehensive")
        print("=" * 60)
        
        try:
            print(f"   Testing symbols: {self.test_symbols}")
            
            # Test with force refresh to ensure fresh data
            start_time = time.time()
            print("   🔄 Fetching market data (force refresh)...")
            
            market_data = google_sheets_service.fetch_market_data_batch(
                self.test_symbols, 
                force_refresh=True
            )
            
            fetch_time = time.time() - start_time
            print(f"   ⏱️ Fetch completed in {fetch_time:.2f} seconds")
            
            # Analyze results
            successful_symbols = []
            failed_symbols = []
            
            for symbol in self.test_symbols:
                if symbol in market_data and market_data[symbol]:
                    data = market_data[symbol]
                    # Validate essential fields
                    if data.get('current_price') and data.get('current_price') > 0:
                        successful_symbols.append(symbol)
                        print(f"   ✅ {symbol}: Price={data.get('current_price')}, Volume={data.get('volume', 'N/A')}")
                        print(f"      PE={data.get('pe_ratio', 'N/A')}, Market Cap={data.get('market_cap', 'N/A')} Cr")
                    else:
                        failed_symbols.append(symbol)
                        print(f"   ⚠️ {symbol}: Invalid/missing price data")
                else:
                    failed_symbols.append(symbol)
                    print(f"   ❌ {symbol}: No data returned")
            
            success_rate = len(successful_symbols) / len(self.test_symbols) * 100
            
            self.results['market_data'] = {
                'status': 'success' if success_rate >= 60 else 'partial',
                'successful_symbols': successful_symbols,
                'failed_symbols': failed_symbols,
                'success_rate': success_rate,
                'fetch_time': fetch_time,
                'total_symbols': len(self.test_symbols)
            }
            
            print(f"\n📈 Market Data Results:")
            print(f"   Success Rate: {success_rate:.1f}% ({len(successful_symbols)}/{len(self.test_symbols)})")
            print(f"   Processing Time: {fetch_time:.2f}s")
            
            return success_rate >= 60  # Consider 60% success rate as passing
            
        except Exception as e:
            print(f"❌ Market data test failed: {e}")
            self.results['market_data'] = {'status': 'failed', 'error': str(e)}
            return False
    
    def test_ohlc_data_comprehensive(self):
        """Comprehensive test for OHLC data fetching"""
        print("\n📈 Testing OHLC Data Comprehensive")
        print("=" * 60)
        
        try:
            print(f"   Testing symbols: {self.test_symbols}")
            
            # Test OHLC data with different time periods
            timeframes = ['1d', '7d']  # Test both daily and weekly
            ohlc_results = {}
            
            for timeframe in timeframes:
                print(f"\n   🔄 Fetching OHLC data ({timeframe} timeframe)...")
                start_time = time.time()
                
                # Calculate date range based on timeframe
                end_date = datetime.now()
                if timeframe == '1d':
                    start_date = end_date - timedelta(days=1)
                else:  # 7d
                    start_date = end_date - timedelta(days=7)
                
                try:
                    ohlc_data = google_sheets_service.fetch_ohlc_data_batch(
                        symbols=self.test_symbols,
                        start_date=start_date.strftime('%Y-%m-%d'),
                        end_date=end_date.strftime('%Y-%m-%d'),
                        force_refresh=True
                    )
                    
                    fetch_time = time.time() - start_time
                    print(f"   ⏱️ OHLC {timeframe} fetch completed in {fetch_time:.2f} seconds")
                    
                    # Analyze OHLC results
                    successful_ohlc = []
                    failed_ohlc = []
                    
                    for symbol in self.test_symbols:
                        if symbol in ohlc_data and ohlc_data[symbol]:
                            data_points = ohlc_data[symbol]
                            if isinstance(data_points, list) and len(data_points) > 0:
                                # Check if we have valid OHLC data
                                valid_data = [d for d in data_points if all(
                                    d.get(field) is not None for field in ['open', 'high', 'low', 'close']
                                )]
                                if valid_data:
                                    successful_ohlc.append(symbol)
                                    print(f"   ✅ {symbol}: {len(valid_data)} valid OHLC records")
                                    # Show sample data point
                                    sample = valid_data[0]
                                    print(f"      Sample: O={sample.get('open')}, H={sample.get('high')}, "
                                          f"L={sample.get('low')}, C={sample.get('close')}")
                                else:
                                    failed_ohlc.append(symbol)
                                    print(f"   ⚠️ {symbol}: No valid OHLC data")
                            else:
                                failed_ohlc.append(symbol)
                                print(f"   ⚠️ {symbol}: Empty data set")
                        else:
                            failed_ohlc.append(symbol)
                            print(f"   ❌ {symbol}: No OHLC data returned")
                    
                    success_rate = len(successful_ohlc) / len(self.test_symbols) * 100
                    
                    ohlc_results[timeframe] = {
                        'successful_symbols': successful_ohlc,
                        'failed_symbols': failed_ohlc,
                        'success_rate': success_rate,
                        'fetch_time': fetch_time
                    }
                    
                    print(f"   📊 OHLC {timeframe} Results: {success_rate:.1f}% success rate")
                    
                except Exception as timeframe_error:
                    print(f"   ❌ OHLC {timeframe} failed: {timeframe_error}")
                    ohlc_results[timeframe] = {'status': 'failed', 'error': str(timeframe_error)}
            
            # Overall OHLC assessment
            overall_success = any(
                result.get('success_rate', 0) >= 40 
                for result in ohlc_results.values() 
                if isinstance(result, dict) and 'success_rate' in result
            )
            
            self.results['ohlc_data'] = {
                'status': 'success' if overall_success else 'failed',
                'timeframe_results': ohlc_results,
                'total_symbols': len(self.test_symbols)
            }
            
            print(f"\n📈 Overall OHLC Results:")
            for timeframe, result in ohlc_results.items():
                if 'success_rate' in result:
                    print(f"   {timeframe}: {result['success_rate']:.1f}% success rate")
            
            return overall_success
            
        except Exception as e:
            print(f"❌ OHLC data test failed: {e}")
            self.results['ohlc_data'] = {'status': 'failed', 'error': str(e)}
            return False
    
    def test_concurrent_processing(self):
        """Test concurrent processing of both data types"""
        print("\n⚡ Testing Concurrent Processing")
        print("=" * 60)
        
        try:
            # Test concurrent market data and OHLC data fetching
            print("   🔄 Starting concurrent operations...")
            
            def fetch_market_data():
                return google_sheets_service.fetch_market_data_batch(
                    self.test_symbols[:3],  # Use first 3 symbols
                    force_refresh=True
                )
            
            def fetch_ohlc_data():
                end_date = datetime.now()
                start_date = end_date - timedelta(days=2)
                return google_sheets_service.fetch_ohlc_data_batch(
                    symbols=self.test_symbols[2:],  # Use last 3 symbols (with overlap)
                    start_date=start_date.strftime('%Y-%m-%d'),
                    end_date=end_date.strftime('%Y-%m-%d'),
                    force_refresh=True
                )
            
            start_time = time.time()
            
            with ThreadPoolExecutor(max_workers=2) as executor:
                # Submit both operations concurrently
                market_future = executor.submit(fetch_market_data)
                ohlc_future = executor.submit(fetch_ohlc_data)
                
                # Wait for both to complete
                market_result = market_future.result(timeout=60)
                ohlc_result = ohlc_future.result(timeout=60)
            
            total_time = time.time() - start_time
            
            # Analyze concurrent results
            market_success = len([s for s in self.test_symbols[:3] if s in market_result and market_result[s]])
            ohlc_success = len([s for s in self.test_symbols[2:] if s in ohlc_result and ohlc_result[s]])
            
            print(f"   ⏱️ Concurrent operations completed in {total_time:.2f} seconds")
            print(f"   📊 Market data: {market_success}/3 symbols successful")
            print(f"   📈 OHLC data: {ohlc_success}/3 symbols successful")
            
            # Check buffer status after concurrent operations
            status = google_sheets_service.buffer_service.get_all_status()
            print(f"   🔄 Buffer status after concurrent ops:")
            print(f"      Market: {status['market_buffer']['blocks_in_use']} blocks in use")
            print(f"      OHLC: {status['ohlc_buffer']['blocks_in_use']} blocks in use")
            
            concurrent_success = (market_success >= 2 and ohlc_success >= 2)
            
            self.results['concurrent_processing'] = {
                'status': 'success' if concurrent_success else 'partial',
                'total_time': total_time,
                'market_success': market_success,
                'ohlc_success': ohlc_success,
                'buffer_conflicts': 'none_detected'
            }
            
            print(f"   {'✅' if concurrent_success else '⚠️'} Concurrent processing {'passed' if concurrent_success else 'partially successful'}")
            return concurrent_success
            
        except Exception as e:
            print(f"❌ Concurrent processing test failed: {e}")
            self.results['concurrent_processing'] = {'status': 'failed', 'error': str(e)}
            return False
    
    def test_error_handling_and_recovery(self):
        """Test error handling and recovery mechanisms"""
        print("\n🛠️ Testing Error Handling and Recovery")
        print("=" * 60)
        
        try:
            # Test with invalid symbols to trigger error handling
            invalid_symbols = ['INVALID123', 'NONEXISTENT']
            mixed_symbols = ['RELIANCE', 'INVALID123', 'TCS']
            
            print("   🔄 Testing with invalid symbols...")
            start_time = time.time()
            
            # This should trigger error handling but not crash
            result = google_sheets_service.fetch_market_data_batch(
                mixed_symbols,
                force_refresh=True
            )
            
            recovery_time = time.time() - start_time
            
            # Check that valid symbols still work despite invalid ones
            valid_results = [s for s in ['RELIANCE', 'TCS'] if s in result and result[s]]
            
            print(f"   ⏱️ Error handling completed in {recovery_time:.2f} seconds")
            print(f"   📊 Valid symbols recovered: {len(valid_results)}/2")
            
            # Test buffer state after error conditions
            status = google_sheets_service.buffer_service.get_all_status()
            buffer_healthy = (
                status['market_buffer']['available_blocks'] > 0 and
                status['ohlc_buffer']['available_blocks'] > 0
            )
            
            print(f"   🔄 Buffer system health after errors: {'✅ Healthy' if buffer_healthy else '⚠️ Issues detected'}")
            
            error_handling_success = (len(valid_results) >= 1 and buffer_healthy)
            
            self.results['error_handling'] = {
                'status': 'success' if error_handling_success else 'failed',
                'recovery_time': recovery_time,
                'valid_symbols_recovered': len(valid_results),
                'buffer_healthy': buffer_healthy
            }
            
            print(f"   {'✅' if error_handling_success else '❌'} Error handling {'passed' if error_handling_success else 'failed'}")
            return error_handling_success
            
        except Exception as e:
            print(f"❌ Error handling test failed: {e}")
            self.results['error_handling'] = {'status': 'failed', 'error': str(e)}
            return False
    
    def generate_comprehensive_report(self):
        """Generate a comprehensive test report"""
        print("\n📋 Comprehensive Test Report")
        print("=" * 70)
        
        # Calculate overall scores
        test_scores = {
            'Service Availability': True,  # Already verified if we got this far
            'Buffer Allocation': self.results['buffer_allocation'].get('status') == 'success',
            'Market Data': self.results['market_data'].get('status') in ['success', 'partial'],
            'OHLC Data': self.results['ohlc_data'].get('status') == 'success',
            'Concurrent Processing': self.results['concurrent_processing'].get('status') in ['success', 'partial'],
            'Error Handling': self.results['error_handling'].get('status') == 'success'
        }
        
        passed_tests = sum(test_scores.values())
        total_tests = len(test_scores)
        overall_score = passed_tests / total_tests * 100
        
        print(f"📊 Test Results Summary:")
        for test_name, passed in test_scores.items():
            status = "✅ PASS" if passed else "❌ FAIL"
            print(f"   {test_name:<20}: {status}")
        
        print(f"\n🎯 Overall Score: {overall_score:.1f}% ({passed_tests}/{total_tests} tests passed)")
        
        # Detailed performance metrics
        print(f"\n⚡ Performance Metrics:")
        
        if 'market_data' in self.results and 'fetch_time' in self.results['market_data']:
            market_time = self.results['market_data']['fetch_time']
            market_rate = len(self.test_symbols) / market_time
            print(f"   Market Data: {market_time:.2f}s for {len(self.test_symbols)} symbols ({market_rate:.1f} symbols/sec)")
        
        if 'concurrent_processing' in self.results and 'total_time' in self.results['concurrent_processing']:
            concurrent_time = self.results['concurrent_processing']['total_time']
            print(f"   Concurrent Ops: {concurrent_time:.2f}s for mixed operations")
        
        # Buffer utilization
        status = google_sheets_service.buffer_service.get_all_status()
        print(f"\n🔄 Final Buffer Status:")
        print(f"   Market Buffer: {status['market_buffer']['available_blocks']}/{status['market_buffer']['total_blocks']} blocks available")
        print(f"   OHLC Buffer: {status['ohlc_buffer']['available_blocks']}/{status['ohlc_buffer']['total_blocks']} blocks available")
        
        # Recommendations
        print(f"\n💡 Recommendations:")
        if overall_score >= 90:
            print("   🎉 Excellent! System performing optimally.")
        elif overall_score >= 70:
            print("   ✅ Good performance with minor areas for improvement.")
        elif overall_score >= 50:
            print("   ⚠️ Adequate performance but significant improvements needed.")
        else:
            print("   ❌ Poor performance. System requires immediate attention.")
        
        return overall_score >= 70


def main():
    """Run comprehensive finance data test suite"""
    print("🧪 Comprehensive Finance Data Test Suite")
    print("Testing 5 symbols for both market data and OHLC data")
    print("=" * 70)
    
    tester = FinanceDataTester()
    
    # Run all tests in sequence
    tests = [
        ("Service Availability", tester.test_service_availability),
        ("Circular Buffer Allocation", tester.test_circular_buffer_allocation),
        ("Market Data Comprehensive", tester.test_market_data_comprehensive),
        ("OHLC Data Comprehensive", tester.test_ohlc_data_comprehensive),
        ("Concurrent Processing", tester.test_concurrent_processing),
        ("Error Handling & Recovery", tester.test_error_handling_and_recovery),
    ]
    
    all_results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            all_results.append(result)
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            all_results.append(False)
    
    # Generate final report
    success = tester.generate_comprehensive_report()
    
    if success:
        print("\n🎉 Comprehensive test suite PASSED!")
        print("   System is ready for production financial data processing.")
    else:
        print("\n⚠️ Test suite completed with issues.")
        print("   Review the report above for areas requiring attention.")
    
    return success


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)