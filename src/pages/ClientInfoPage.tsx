import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../app/store";
import { fetchClientInfo, type ClientBeneficiairePerson } from "../app/clientSlice";
import {
  ArrowLeft, CheckCircle, XCircle,
  FileText, User, Briefcase, GraduationCap,
  Phone, AlertCircle, Loader2, Plus, ChevronDown, ChevronUp, Eye
} from "lucide-react";
import AddBeneficiaireModal from "./components/AddBeneficiaireModal";
import StatusBadge from "./components/StatusBadge";
import DocumentRow from "./components/DocumentRow";
import AddPersonModal from "./components/AddPersonModal";

// ── Utilitaires ──
const InfoField = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
    <p className="text-sm font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
      {value || <span className="text-gray-400 italic">—</span>}
    </p>
  </div>
);

const SectionTitle = ({ icon: Icon, title }: { icon: any; title: string }) => (
  <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
    <Icon size={18} className="text-blue-600" />
    {title}
  </h2>
);

const Td = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <td className={`px-4 py-3 text-sm text-gray-700 whitespace-nowrap ${className}`}>{children}</td>
);

const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left bg-gray-50">
    {children}
  </th>
);

// ── Page principale ──
const ClientInfoPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);
  const { data: client, loading, error } = useSelector((state: RootState) => state.client);

  const [activeTab, setActiveTab] = useState<'beneficiaires' | 'pieces'>('beneficiaires');
  const [showModal, setShowModal] = useState(false);
  const [personModal, setPersonModal] = useState<{ id: string; nom: string } | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    if (token) dispatch(fetchClientInfo(token));
  }, [token, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 size={20} className="animate-spin text-blue-600" />
          <span className="text-sm">Chargement des informations...</span>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-red-500">
          <AlertCircle size={20} />
          <span className="text-sm">{error || 'Données introuvables.'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Retour */}
        <button
          onClick={() => navigate("/menu")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition text-sm"
        >
          <ArrowLeft size={16} />
          Retour au menu
        </button>

        {/* ── Carte compte ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{client.nom}</h1>
              <p className="text-xs text-gray-400 mt-0.5">ID Visa : {client.idVisaAbstract || '—'}</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Badge actif */}
              <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${
                client.actif
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-600 border-red-200'
              }`}>
                {client.actif
                  ? <CheckCircle size={13} />
                  : <XCircle size={13} />}
                {client.actif ? 'Actif' : 'Inactif'}
              </span>
              {/* Badge validé */}
              <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${
                client.isValidate
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-gray-50 text-gray-500 border-gray-200'
              }`}>
                {client.isValidate
                  ? <CheckCircle size={13} />
                  : <XCircle size={13} />}
                {client.isValidate ? 'Validé' : 'Non validé'}
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Créé le {new Date(client.createdAt).toLocaleString('fr-FR', {
              day: '2-digit', month: 'long', year: 'numeric',
              hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </div>

        {/* ── Onglets ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Tab bar */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 pt-4">
            <div className="flex gap-1">
              {[
                { key: 'beneficiaires', label: 'Bénéficiaires', icon: User },
                { key: 'pieces', label: 'Pièces jointes', icon: FileText },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-all ${
                    activeTab === key
                      ? 'text-blue-600 border-blue-600 bg-blue-50/50'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={15} />
                  {label}
                  {key === 'beneficiaires' && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                      activeTab === key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {client.clientBeneficiaireForms.length}
                    </span>
                  )}
                  {key === 'pieces' && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                      activeTab === key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {client.userDocument.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Bouton Ajouter contextuel */}
            {activeTab === 'beneficiaires' && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
              >
                <Plus size={14} />
                Ajouter un bénéficiaire
              </button>
            )}
          </div>

          {/* ── Contenu onglet Bénéficiaires ── */}
          {activeTab === 'beneficiaires' && (
            <div className="p-0">
              {client.clientBeneficiaireForms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <User size={36} className="mb-3 opacity-30" />
                  <p className="text-sm">Aucun bénéficiaire enregistré.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <Th>Nom complet</Th>
                        <Th>Nationalité</Th>
                        <Th>Date de naissance</Th>
                        <Th>Téléphone</Th>
                        <Th>Statut</Th>
                        <Th>Personnes liées</Th>
                        <Th>Actions</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {client.clientBeneficiaireForms.map((b, idx) => (
                        <>
                          {/* Ligne principale */}
                          <tr
                            key={b.id}
                            className={`hover:bg-gray-50 transition-colors ${expandedRow === b.id ? 'bg-blue-50/30' : ''}`}
                          >
                            <Td>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                                  {b.prenom?.[0]}{b.nom?.[0]}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">{b.prenom} {b.nom}</p>
                                  <p className="text-xs text-gray-400">{b.email || '—'}</p>
                                </div>
                              </div>
                            </Td>
                            <Td>{b.nationalite || '—'}</Td>
                            <Td>{new Date(b.dateNaissance).toLocaleDateString('fr-FR')}</Td>
                            <Td>{b.numero || '—'}</Td>
                            <Td><StatusBadge status={b.status} /></Td>
                            <Td>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                                {b.clientBeneficiairePerson.length} personne{b.clientBeneficiairePerson.length !== 1 ? 's' : ''}
                              </span>
                            </Td>
                            <Td>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setExpandedRow(expandedRow === b.id ? null : b.id)}
                                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition"
                                >
                                  <Eye size={13} />
                                  {expandedRow === b.id ? 'Masquer' : 'Détails'}
                                  {expandedRow === b.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                </button>
                                <button
                                  onClick={() => setPersonModal({ id: b.id, nom: `${b.prenom} ${b.nom}` })}
                                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 font-medium border border-gray-200 px-2 py-1 rounded-lg transition hover:bg-gray-100"
                                >
                                  <Plus size={11} />
                                  Personne
                                </button>
                              </div>
                            </Td>
                          </tr>

                          {/* Ligne expandée — détails complets */}
                          {expandedRow === b.id && (
                            <tr key={`${b.id}-expanded`}>
                              <td colSpan={7} className="px-6 py-6 bg-gray-50 border-b border-gray-100">
                                <div className="space-y-6">

                                  {/* Identité */}
                                  <div>
                                    <SectionTitle icon={User} title="Identité complète" />
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                      <InfoField label="Sexe" value={b.sexe} />
                                      <InfoField label="État civil" value={b.etatCivil} />
                                      <InfoField label="Lieu de naissance" value={b.lieuNaissance} />
                                      <InfoField label="Pays de résidence" value={b.paysResidence} />
                                      <InfoField label="Adresse" value={b.adresse} />
                                      <InfoField label="Email" value={b.email} />
                                    </div>
                                  </div>

                                  {/* Contact urgence */}
                                  <div>
                                    <SectionTitle icon={Phone} title="Contact d'urgence" />
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                      <InfoField label="Nom" value={b.nomContactUrgence} />
                                      <InfoField label="Prénom" value={b.prenomContactUrgence} />
                                      <InfoField label="Téléphone" value={b.numeroContactUrgence} />
                                      <InfoField label="Email" value={b.emailContactUrgence} />
                                    </div>
                                  </div>

                                  {/* Profession */}
                                  <div>
                                    <SectionTitle icon={Briefcase} title="Profession" />
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                      <InfoField label="Profession" value={b.professionActuelle} />
                                      <InfoField label="Employeur" value={b.nomEmployeur} />
                                      <InfoField label="Tél. pro" value={b.numeroTelephone} />
                                      <InfoField label="Email pro" value={b.emailProfessionnel} />
                                      <InfoField label="Adresse pro" value={b.adresseProfessionnel} />
                                    </div>
                                  </div>

                                  {/* Formation */}
                                  <div>
                                    <SectionTitle icon={GraduationCap} title="Formation" />
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                      <InfoField label="Établissement" value={b.etablissement} />
                                      <InfoField label="Diplôme" value={b.diplome} />
                                    </div>
                                  </div>

                                  {/* Document */}
                                  <div>
                                    <SectionTitle icon={FileText} title="Document d'identité" />
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                      <InfoField label="Type" value={b.typeDoc} />
                                      <InfoField label="Référence" value={b.referenceDoc} />
                                      <InfoField label="Délivrance" value={new Date(b.dateDelivranceDoc).toLocaleDateString('fr-FR')} />
                                      <InfoField label="Validité" value={new Date(b.dateValiditeDoc).toLocaleDateString('fr-FR')} />
                                    </div>
                                  </div>

                                  {/* Personnes liées en mini-tableau */}
                                  {b.clientBeneficiairePerson.length > 0 && (
                                    <div>
                                      <SectionTitle icon={User} title="Personnes liées" />
                                      <div className="overflow-x-auto rounded-xl border border-gray-200">
                                        <table className="w-full">
                                          <thead>
                                            <tr className="bg-gray-100">
                                              <Th>Nom</Th>
                                              <Th>Type</Th>
                                              <Th>Sexe</Th>
                                              <Th>Nationalité</Th>
                                              <Th>Date de naissance</Th>
                                              <Th>Téléphone</Th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-gray-100 bg-white">
                                            {b.clientBeneficiairePerson.map((p: ClientBeneficiairePerson) => (
                                              <tr key={p.id} className="hover:bg-gray-50">
                                                <Td>
                                                  <p className="font-semibold text-gray-900">{p.prenom} {p.nom}</p>
                                                </Td>
                                                <Td>
                                                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                                    p.typePerson === 'CONJOINT'
                                                      ? 'bg-purple-100 text-purple-700'
                                                      : 'bg-blue-100 text-blue-700'
                                                  }`}>
                                                    {p.typePerson === 'CONJOINT' ? '💍 Conjoint(e)' : '👶 Enfant'}
                                                  </span>
                                                </Td>
                                                <Td>{p.sexe || '—'}</Td>
                                                <Td>{p.nationalite || '—'}</Td>
                                                <Td>{new Date(p.dateNaissance).toLocaleDateString('fr-FR')}</Td>
                                                <Td>{p.numero || '—'}</Td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Contenu onglet Pièces ── */}
          {activeTab === 'pieces' && (
            <div className="p-0">
              {client.userDocument.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <FileText size={36} className="mb-3 opacity-30" />
                  <p className="text-sm">Aucun document disponible.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <Th>Document</Th>
                        <Th>Type</Th>
                        <Th>Date d'ajout</Th>
                        <Th>Statut</Th>
                        <Th>Actions</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {client.userDocument.map((doc) => (
                        <DocumentRow key={doc.id} doc={doc} asTableRow />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Modals */}
      {showModal && <AddBeneficiaireModal onClose={() => setShowModal(false)} />}
      {personModal && (
        <AddPersonModal
          beneficiaireId={personModal.id}
          beneficiaireNom={personModal.nom}
          onClose={() => setPersonModal(null)}
        />
      )}
    </div>
  );
};

export default ClientInfoPage;