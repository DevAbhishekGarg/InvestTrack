import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {fetchHoldings} from '../services/api';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';

export interface Root {
  userHolding: UserHolding[];
}

export interface UserHolding {
  symbol: string;
  quantity: number;
  ltp: number;
  avgPrice: number;
  close: number;
}

const HoldingsList = () => {
  const [holdings, setHoldings] = useState<UserHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['25%', '20%'], []);

  // Function to open the bottom sheet
  const handleOpenBottomSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  // Function to close the bottom sheet
  const handleCloseBottomSheet = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  //make API Call to fetch holdings
  useEffect(() => {
    setLoading(true);
    const loadData = async () => {
      try {
        const data = await fetchHoldings();
        setHoldings(data?.userHolding ?? []);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch holdings:', error);
        setHoldings([]);
      }
    };
    loadData();
  }, []);

  const totalPNL = holdings.reduce(
    (sum, item) =>
      sum + (item.ltp * item.quantity - item.avgPrice * item.quantity),
    0,
  );

  const totalCurrentValue = holdings.reduce(
    (sum, item) => sum + item.ltp * item.quantity,
    0,
  );

  const totalInvestment = holdings.reduce(
    (sum, item) => sum + item.avgPrice * item.quantity,
    0,
  );

  const todaysPNL = holdings.reduce(
    (sum, item) => sum + (item.close - item.ltp) * item.quantity,
    0,
  );

  //All list Items
  const renderItem = ({item}: any) => (
    <View style={styles.item}>
      <View style={styles.midContainer}>
        <Text style={styles.symbolText}>{item.symbol}</Text>
        <Text style={styles.symbolText}>₹{item.ltp?.toFixed(2) ?? 'N/A'}</Text>
      </View>

      <View style={[styles.midContainer, styles.margin]}>
        <Text style={styles.smallSymbolText}>{item.symbol}</Text>
        <Text>Qty: {item.quantity}</Text>
      </View>

      <View style={[styles.midContainer, styles.margin]}>
        <Text style={styles.totalValue}>
          Total Value: ₹{(item.ltp * item.quantity).toFixed(2)}
        </Text>
        <Text>
          P&L: ₹
          {(item.ltp * item.quantity - item.avgPrice * item.quantity).toFixed(
            2,
          )}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.holdingText}>My Holdings</Text>

      {loading ? (
        <>
          <ActivityIndicator style={styles.loader} />
          <Text style={styles.noDataText}>Please Wait...</Text>
        </>
      ) : holdings.length > 0 ? (
        <>
          <FlatList
            data={holdings}
            renderItem={renderItem}
            keyExtractor={item => item.symbol}
          />
          <TouchableOpacity
            style={styles.summaryButton}
            onPress={() => handleOpenBottomSheet()}>
            <Text style={styles.buttonText}>
              Total P&L: ₹{totalPNL.toFixed(2)}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.noDataText}>No data available</Text>
      )}

      {/* Bottom Sheet for P&L Summary */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}>
        <BottomSheetView style={styles.sheetContent}>
          <View style={styles.midContainer}>
            <Text style={styles.leftText}>Current Value:</Text>
            <Text style={styles.rightText}>
              ₹{totalCurrentValue.toFixed(2)}
            </Text>
          </View>

          <View style={styles.midContainer}>
            <Text style={[styles.leftText]}>Total Investment:</Text>
            <Text style={styles.rightText}>₹{totalInvestment.toFixed(2)}</Text>
          </View>

          <View style={styles.midContainer}>
            <Text style={[styles.leftText]}>Today's P&L:</Text>
            <Text style={styles.rightText}>₹{todaysPNL.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={styles.summaryButton}
            onPress={() => handleCloseBottomSheet()}>
            <Text style={styles.buttonText}>
              Total P&L: ₹{totalPNL.toFixed(2)}
            </Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  holdingText: {
    fontSize: 22,
    padding: 16,
    color: 'white',
    backgroundColor: '#AD00E9',
  },
  smallSymbolText: {
    fontSize: 12,
    color: '#777',
  },
  margin: {
    marginTop: 8,
  },
  symbolText: {
    fontWeight: 'bold',
    color: '#000',
  },
  sheetContent: {
    padding: 16,
  },
  totalValue: {
    fontWeight: '500',
    color: '#000',
  },
  midContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  summaryButton: {
    padding: 16,
    backgroundColor: '#ECFEF4',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  leftText: {
    color: '#777',
  },
  rightText: {
    color: '#000',
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 20,
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'black',
    marginTop: 20,
  },
});

export default HoldingsList;
