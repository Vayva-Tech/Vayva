/**
 * Healthcare - Patients Screen
 * 
 * Displays list of patients with search, filter, and offline support
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { backendAPIService } from '../../services/api/backend-api.service';
import { database } from '../../database';
import type { Patient } from '../../database/models/Patient';
import Icon from 'lucide-react-native';

interface PatientItemProps {
  patient: any;
  onPress: (patient: any) => void;
}

const PatientItem: React.FC<PatientItemProps> = ({ patient, onPress }) => {
  return (
    <TouchableOpacity style={styles.patientCard} onPress={() => onPress(patient)}>
      <View style={styles.patientHeader}>
        <Text style={styles.patientName}>{patient.first_name} {patient.last_name}</Text>
        <Text style={styles.patientId}>ID: {patient.id}</Text>
      </View>
      
      <View style={styles.patientInfo}>
        <View style={styles.infoRow}>
          <Icon name="calendar" size={16} color="#666" />
          <Text style={styles.infoText}>DOB: {patient.date_of_birth}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Icon name="phone" size={16} color="#666" />
          <Text style={styles.infoText}>{patient.phone}</Text>
        </View>
        
        {patient.allergies && (
          <View style={[styles.alertBox, styles.allergyAlert]}>
            <Icon name="alert-circle" size={16} color="#ef4444" />
            <Text style={styles.alertText}>Allergies: {patient.allergies}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function PatientsScreen({ navigation }: any) {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      loadPatients();
    }, [])
  );

  async function loadPatients() {
    try {
      setLoading(true);
      setError(null);

      // Try to load from local database first (offline-first)
      const localPatients = await database
        .get<Patient>('patients')
        .query()
        .fetch();

      if (localPatients.length > 0) {
        setPatients(localPatients);
        setLoading(false);
      }

      // Then sync with backend
      const response = await backendAPIService.getPatients();
      
      // Update local database with fresh data
      await database.write(async () => {
        // Delete existing records
        await localPatients.forEach(p => p.destroyPermanently());
        
        // Insert fresh data
        for (const patientData of response.data) {
          await database.get<Patient>('patients').create((record) => {
            record._raw = sanitizeRecord(patientData);
          });
        }
      });

      setPatients(response.data);
    } catch (err: any) {
      console.error('[PATIENTS] Load error:', err);
      setError(err.message || 'Failed to load patients');
      
      // If API fails, try to show cached data
      try {
        const cachedPatients = await database
          .get<Patient>('patients')
          .query()
          .fetch();
        
        if (cachedPatients.length > 0) {
          setPatients(cachedPatients);
        }
      } catch (cacheErr) {
        console.error('[PATIENTS] Cache error:', cacheErr);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function sanitizeRecord(data: any): any {
    return {
      id: data.id,
      first_name: data.firstName || data.first_name || '',
      last_name: data.lastName || data.last_name || '',
      date_of_birth: data.dateOfBirth || data.date_of_birth || '',
      email: data.email || '',
      phone: data.phone || '',
      insurance_provider: data.insuranceProvider || data.insurance_provider || '',
      insurance_id: data.insuranceId || data.insurance_id || '',
      allergies: data.allergies || '',
      medications: data.medications || '',
      created_at: data.createdAt || Date.now(),
      updated_at: data.updatedAt || Date.now(),
    };
  }

  function handlePatientPress(patient: any) {
    navigation.navigate('PatientDetails', { patientId: patient.id });
  }

  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) ||
           patient.id.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading && patients.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text style={styles.loadingText}>Loading patients...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search patients..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="x" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddPatient')}
        >
          <Icon name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Icon name="alert-triangle" size={20} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Patient List */}
      <FlatList
        data={filteredPatients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PatientItem patient={item} onPress={handlePatientPress} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadPatients}
            tintColor="#0ea5e9"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="users" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No patients found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    paddingVertical: 12,
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: '#0ea5e9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    marginLeft: 8,
    color: '#dc2626',
    fontSize: 14,
  },
  patientCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  patientId: {
    fontSize: 12,
    color: '#94a3b8',
  },
  patientInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 8,
    borderRadius: 6,
    gap: 8,
    marginTop: 8,
  },
  allergyAlert: {
    backgroundColor: '#fef2f2',
  },
  alertText: {
    fontSize: 13,
    color: '#dc2626',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#94a3b8',
  },
});
