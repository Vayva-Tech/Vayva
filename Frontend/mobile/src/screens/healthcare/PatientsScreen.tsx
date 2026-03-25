/**
 * Healthcare - Patients Screen
 * 
 * Displays list of patients with search, filter, and offline support
 */

import React, { useState } from 'react';
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
import { database, PatientModel } from '../../database';
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  Phone,
  Plus,
  Search,
  Users,
  X,
} from 'lucide-react-native';

interface PatientListRow {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  email: string;
  phone: string;
  allergies?: string;
  medications?: string;
}

/** Normalized patient row for Watermelon + list state. */
interface SanitizedPatientRecord {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  email: string;
  phone: string;
  insurance_provider: string;
  insurance_id: string;
  allergies: string;
  medications: string;
  created_at: number;
  updated_at: number;
}

interface PatientItemProps {
  patient: PatientListRow;
  onPress: (patient: PatientListRow) => void;
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
          <Calendar size={16} color="#666" />
          <Text style={styles.infoText}>DOB: {patient.date_of_birth}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Phone size={16} color="#666" />
          <Text style={styles.infoText}>{patient.phone}</Text>
        </View>
        
        {patient.allergies && (
          <View style={[styles.alertBox, styles.allergyAlert]}>
            <AlertCircle size={16} color="#ef4444" />
            <Text style={styles.alertText}>Allergies: {patient.allergies}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

function patientModelToRow(p: PatientModel): PatientListRow {
  return {
    id: p.id,
    first_name: p.firstName,
    last_name: p.lastName,
    date_of_birth: p.dateOfBirth ?? "",
    email: p.email ?? "",
    phone: p.phone ?? "",
    allergies: p.allergies,
    medications: p.medications,
  };
}

type NavigationLike = { navigate: (routeName: string, params?: Record<string, unknown>) => void };
export default function PatientsScreen({ navigation }: { navigation: NavigationLike }) {
  const [patients, setPatients] = useState<PatientListRow[]>([]);
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
        .get<PatientModel>("patients")
        .query()
        .fetch();

      if (localPatients.length > 0) {
        setPatients(localPatients.map(patientModelToRow));
        setLoading(false);
      }

      // Then sync with backend
      const response = await backendAPIService.getPatients();

      // Update local database with fresh data
      await database.write(async () => {
        for (const p of localPatients) {
          await p.destroyPermanently();
        }

        const collection = database.get<PatientModel>("patients");
        for (const patientData of response.data as unknown[]) {
          const raw = sanitizeRecord(patientData as Record<string, unknown>);
          await collection.create((record: PatientModel) => {
            record._raw.id = raw.id;
            record.firstName = raw.first_name;
            record.lastName = raw.last_name;
            record.dateOfBirth = raw.date_of_birth;
            record.email = raw.email;
            record.phone = raw.phone;
            record.insuranceProvider = raw.insurance_provider;
            record.insuranceId = raw.insurance_id;
            record.allergies = raw.allergies;
            record.medications = raw.medications;
            record.createdAtRaw = raw.created_at;
            record.updatedAtRaw = raw.updated_at;
          });
        }
      });

      setPatients(
        (response.data as Record<string, unknown>[]).map((d) => {
          const r = sanitizeRecord(d);
          return {
            id: r.id,
            first_name: r.first_name,
            last_name: r.last_name,
            date_of_birth: r.date_of_birth,
            email: r.email,
            phone: r.phone,
            allergies: r.allergies || undefined,
            medications: r.medications || undefined,
          };
        }),
      );
    } catch (err: unknown) {
      console.error('[PATIENTS] Load error:', err);
      setError(err instanceof Error ? err.message : "Failed to load patients");
      
      // If API fails, try to show cached data
      try {
        const cachedPatients = await database
          .get<PatientModel>("patients")
          .query()
          .fetch();

        if (cachedPatients.length > 0) {
          setPatients(cachedPatients.map(patientModelToRow));
        }
      } catch (cacheErr) {
        console.error('[PATIENTS] Cache error:', cacheErr);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function sanitizeRecord(data: Record<string, unknown>): SanitizedPatientRecord {
    return {
      id: String(data.id ?? ""),
      first_name: String(data.firstName ?? data.first_name ?? ""),
      last_name: String(data.lastName ?? data.last_name ?? ""),
      date_of_birth: String(data.dateOfBirth ?? data.date_of_birth ?? ""),
      email: String(data.email ?? ""),
      phone: String(data.phone ?? ""),
      insurance_provider: String(
        data.insuranceProvider ?? data.insurance_provider ?? "",
      ),
      insurance_id: String(data.insuranceId ?? data.insurance_id ?? ""),
      allergies: String(data.allergies ?? ""),
      medications: String(data.medications ?? ""),
      created_at: typeof data.createdAt === "number" ? data.createdAt : Date.now(),
      updated_at: typeof data.updatedAt === "number" ? data.updatedAt : Date.now(),
    };
  }

  function handlePatientPress(patient: PatientListRow) {
    navigation.navigate('PatientDetails', { patientId: patient.id });
  }

  const filteredPatients = patients.filter((patient: PatientListRow) => {
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
          <Search size={20} color="#666" />
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
              <X size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddPatient')}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <AlertTriangle size={20} color="#ef4444" />
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
            <Users size={48} color="#ccc" />
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
