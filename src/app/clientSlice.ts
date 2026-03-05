import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../service/Axios';

export interface ClientFormPayload {
  nom: string;
  prenom: string;
  sexe: string;
  dateNaissance: string;
  lieuNaissance: string;
  nationalite: string;
  etatCivil: string;
  numero: string;
  email: string;
  adresse: string;
  paysResidence: string;
  nomContactUrgence: string;
  prenomContactUrgence: string;
  numeroContactUrgence: string;
  emailContactUrgence: string;
  professionActuelle: string;
  nomEmployeur: string;
  numeroTelephone: string;
  emailProfessionnel: string;
  adresseProfessionnel: string;
  etablissement: string;
  diplome: string;
  referenceDoc: string;
  typeDoc: string;
  dateDelivranceDoc: string;
  dateValiditeDoc: string;
}

export interface ClientBeneficiairePerson {
  id: string;
  nom: string;
  prenom: string;
  sexe: string;
  dateNaissance: string;
  lieuNaissance: string;
  nationalite: string;
  etatCivil: string;
  numero: string;
  email: string;
  adresse: string;
  paysResidence: string;
  typePerson: 'CONJOINT' | 'ENFANT';
  clientBeneficiaireFormId: string;
  createdAt: string;
  updatedAt: string;
}

// ── Types ──────────────────────────────────────────────
export interface UserDocument {
  id: string;
  idVisadocClient: string;
  nomDoc: string;
  pj: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface ClientBeneficiaireForm {
  id: string;
  nom: string;
  prenom: string;
  sexe: string;
  dateNaissance: string;
  lieuNaissance: string;
  nationalite: string;
  etatCivil: string;
  numero: string;
  email: string;
  adresse: string;
  paysResidence: string;
  nomContactUrgence: string;
  prenomContactUrgence: string;
  numeroContactUrgence: string;
  emailContactUrgence: string;
  professionActuelle: string;
  nomEmployeur: string;
  numeroTelephone: string;
  emailProfessionnel: string;
  adresseProfessionnel: string;
  etablissement: string;
  diplome: string;
  referenceDoc: string;
  typeDoc: string;
  dateDelivranceDoc: string;
  dateValiditeDoc: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  clientBeneficiairePerson: ClientBeneficiairePerson[];
}

export interface ClientPersonPayload {
  nom: string;
  prenom: string;
  sexe: string;
  dateNaissance: string;
  lieuNaissance: string;
  nationalite: string;
  etatCivil: string;
  numero: string;
  email: string;
  adresse: string;
  paysResidence: string;
  typePerson: 'CONJOINT' | 'ENFANT';
  clientBeneficiaireFormId: string;
}

export interface ClientData {
  id: string;
  nom: string;
  idVisaAbstract: string;
  actif: boolean;
  isValidate: boolean;
  createdAt: string;
  clientBeneficiaireForms: ClientBeneficiaireForm[];
  userDocument: UserDocument[];
}

interface ClientState {
  data: ClientData | null;
  loading: boolean;
  error: string | null;
}

const initialState: ClientState = {
  data: null,
  loading: false,
  error: null,
};

// ── Thunk ──────────────────────────────────────────────
export const fetchClientInfo = createAsyncThunk(
  'client/fetchClientInfo',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/client-form/visa-abstract/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data as ClientData;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Erreur lors de la récupération des données.'
      );
    }
  }
);

export const createClientForm = createAsyncThunk(
  'client/createClientForm',
  async (
    { token, payload }: { token: string; payload: ClientFormPayload },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await axiosInstance.post('/client-form', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Rafraîchit les données après création
      dispatch(fetchClientInfo(token));
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Erreur lors de la création du formulaire."
      );
    }
  }
);

export const uploadDocument = createAsyncThunk(
  'client/uploadDocument',
  async (
    { token, documentId, file }: { token: string; documentId: string; file: File },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append('pj', file);

      await axiosInstance.patch(`/document/${documentId}`, formData, {  // 👈 PATCH + id dans l'URL
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      dispatch(fetchClientInfo(token));
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Erreur lors de l'envoi du document."
      );
    }
  }
);

// ── Thunk ──────────────────────────────────────────────
export const createClientPerson = createAsyncThunk(
  'client/createClientPerson',
  async (
    { token, payload }: { token: string; payload: ClientPersonPayload },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await axiosInstance.post('/client-person', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch(fetchClientInfo(token));
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Erreur lors de l'ajout de la personne."
      );
    }
  }
);

// ── Slice ──────────────────────────────────────────────
const clientSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    clearClientData(state) {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClientInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClientInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchClientInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createClientForm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createClientForm.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createClientForm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createClientPerson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createClientPerson.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createClientPerson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearClientData } = clientSlice.actions;
export default clientSlice.reducer;