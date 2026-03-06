import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../app/store";
import { fetchClientInfo, type ClientBeneficiairePerson } from "../app/clientSlice";
import {
  CheckCircle, XCircle, FileText, User, Briefcase,
  GraduationCap, Phone, AlertCircle, Loader2, Plus,
  ChevronDown, ChevronUp, MoreHorizontal
} from "lucide-react";
import AddBeneficiaireModal from "./components/AddBeneficiaireModal";
import StatusBadge from "./components/StatusBadge";
import DocumentRow from "./components/DocumentRow";
import AddPersonModal from "./components/AddPersonModal";
import Sidebar from "../layouts/Sidebar";

// ── Utilitaires ──
const InfoField = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</label>
    <p className="text-sm font-medium text-gray-800">
      {value || <span className="text-gray-300 italic">—</span>}
    </p>
  </div>
);

const SectionTitle = ({ icon: Icon, title }: { icon: any; title: string }) => (
  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
    <Icon size={13} className="text-blue-500" />
    {title}
  </h3>
);

const Td = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <td className={`px-4 py-3 text-sm text-gray-700 whitespace-nowrap ${className}`}>{children}</td>
);

const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left bg-gray-50/80">
    {children}
  </th>
);

// ── Page principale ──
const ClientInfoPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);
  const { data: client, loading, error } = useSelector((state: RootState) => state.client);

  const [showModal, setShowModal] = useState(false);
  const [personModal, setPersonModal] = useState<{ id: string; nom: string } | null>(null);
  const [showPersonnes, setShowPersonnes] = useState(true);

  useEffect(() => {
    if (token) dispatch(fetchClientInfo(token));
  }, [token, dispatch]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-400">
            <Loader2 size={20} className="animate-spin text-blue-500" />
            <span className="text-sm">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-red-400">
            <AlertCircle size={20} />
            <span className="text-sm">{error || 'Données introuvables.'}</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Dernier bénéficiaire uniquement ──
  const lastB = client.clientBeneficiaireForms.at(-1);

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />

      {/* ── Contenu principal ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
          <div>
            {/* Breadcrumb */}
            <p className="text-xs text-gray-400 mb-0.5">
              Clients / <span className="text-blue-600 font-semibold">{client.nom}</span>
            </p>
            <h1 className="text-xl font-bold text-gray-900">Fiche Client</h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-sm shadow-blue-200"
          >
            <Plus size={15} />
            Ajouter un nouveau information
          </button>
        </header>

        {/* Body — deux colonnes */}
        <div className="flex-1 flex gap-6 p-8 overflow-auto">

          {/* ── Colonne gauche ── */}
          <div className="flex-1 space-y-4 min-w-0">

            {/* Carte client */}
            <div className="bg-white shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center text-base font-bold">
                    {client.nom?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">{client.nom}</h2>
                    <p className="text-xs text-gray-400 mt-0.5">ID Visa : {client.idVisaAbstract || '—'}</p>
                    <p className="text-xs text-gray-400">
                      Créé le {new Date(client.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'long', year: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Type de Visa : Tourisme</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    client.actif ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                  }`}>
                    {client.actif ? <CheckCircle size={11} /> : <XCircle size={11} />}
                    {client.actif ? 'Actif' : 'Inactif'}
                  </span>
                  <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    client.isValidate ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {client.isValidate ? <CheckCircle size={11} /> : <XCircle size={11} />}
                    {client.isValidate ? 'Validé' : 'Non validé'}
                  </span>
                </div>
              </div>
            </div>

            {lastB ? (
              <>
                <div className="flex flex-row justify-between">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 group-hover:text-gray-600 transition">
                    <User size={12} className="text-blue-500" />
                    Personnes liées
                    <span className="ml-1 text-[10px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded-full font-bold">
                      {lastB.clientBeneficiairePerson.length}
                    </span>
                  </p>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={lastB.status} />
                    <button
                      onClick={() => setPersonModal({ id: lastB.id, nom: `${lastB.prenom} ${lastB.nom}` })}
                      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition font-medium"
                    >
                      <Plus size={12} />
                      Personne
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition">
                      <MoreHorizontal size={15} />
                    </button>
                  </div>
                </div>
                

                {/* ── Personnes liées ── */}
                {lastB.clientBeneficiairePerson.length > 0 && (
                  <div className="bg-white shadow-sm p-6">
                    <button
                      onClick={() => setShowPersonnes(!showPersonnes)}
                      className="w-full flex items-center justify-between group mb-1"
                    >
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 group-hover:text-gray-600 transition">
                        <User size={12} className="text-blue-500" />
                        
                        <span className="ml-1 text-[10px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded-full font-bold">
                          {lastB.clientBeneficiairePerson.length}
                        </span>
                      </p>
                      {showPersonnes
                        ? <ChevronUp size={14} className="text-gray-300 group-hover:text-gray-500 transition" />
                        : <ChevronDown size={14} className="text-gray-300 group-hover:text-gray-500 transition" />
                      }
                    </button>

                    {showPersonnes && (
                      <div className="mt-4 overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-100">
                              <Th>Nom</Th>
                              <Th>Type</Th>
                              <Th>Sexe</Th>
                              <Th>Nationalité</Th>
                              <Th>Naissance</Th>
                              <Th>Téléphone</Th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {lastB.clientBeneficiairePerson.map((p: ClientBeneficiairePerson) => (
                              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                <Td><span className="font-semibold text-gray-800">{p.prenom} {p.nom}</span></Td>
                                <Td>
                                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                    p.typePerson === 'CONJOINT'
                                      ? 'bg-purple-50 text-purple-600'
                                      : 'bg-blue-50 text-blue-600'
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
                    )}
                  </div>
                )}

                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <User size={12} className="text-blue-500" /> Identité
                </p>

                {/* ── Identité ── */}
                <div className="bg-white shadow-sm p-6">
                  
                  <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                    <InfoField label="Prénom" value={lastB.prenom} />
                    <InfoField label="Nom" value={lastB.nom} />
                    <InfoField label="Sexe" value={lastB.sexe} />
                    <InfoField label="État civil" value={lastB.etatCivil} />
                    <InfoField label="Nationalité" value={lastB.nationalite} />
                    <InfoField label="Pays de résidence" value={lastB.paysResidence} />
                    <InfoField label="Lieu de naissance" value={lastB.lieuNaissance} />
                    <InfoField label="Date de naissance" value={new Date(lastB.dateNaissance).toLocaleDateString('fr-FR')} />
                    <InfoField label="Téléphone" value={lastB.numero} />
                    <div className="col-span-3">
                      <InfoField label="Adresse" value={lastB.adresse} />
                    </div>
                  </div>
                </div>

                {/* ── Contact urgence + Formation — même ligne ── */}
                <div className="grid grid-cols-2 gap-4">

                  <div className="">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                      <Phone size={12} className="text-blue-500" /> Contact d'urgence
                    </p>
                    <div className="bg-white shadow-sm p-6 space-y-4">
                      <div className="grid grid-cols-3 gap-y-4">
                        <InfoField label="Nom" value={lastB.nomContactUrgence} />
                        <InfoField label="Prénom" value={lastB.prenomContactUrgence} />
                      </div>
                      <div className="grid grid-cols-3 gap-y-4">
                        <InfoField label="Téléphone" value={lastB.numeroContactUrgence} />
                        <InfoField label="Email" value={lastB.emailContactUrgence} />
                      </div>
                    </div>
                  </div>

                  <div className="">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                      <GraduationCap size={12} className="text-blue-500" /> Formation
                    </p>
                    <div className="bg-white shadow-sm p-6 space-y-4">
                      <InfoField label="Établissement" value={lastB.etablissement} />
                      <InfoField label="Diplôme" value={lastB.diplome} />
                    </div>
                  </div>

                </div>

                {/* ── Profession + Document identité — même ligne ── */}
                <div className="grid grid-cols-2 gap-4">

                  <div className="">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                      <Briefcase size={12} className="text-blue-500" /> Profession
                    </p>
                    <div className="bg-white shadow-sm p-6 space-y-4">
                      <div className="grid grid-cols-3 gap-y-4">
                        <InfoField label="Profession" value={lastB.professionActuelle} />
                        <InfoField label="Employeur" value={lastB.nomEmployeur} />
                      </div>
                      <div className="grid grid-cols-3 gap-y-4">
                        <InfoField label="Tél. pro" value={lastB.numeroTelephone} />
                        <InfoField label="Email pro" value={lastB.emailProfessionnel} />
                        <InfoField label="Adresse pro" value={lastB.adresseProfessionnel} />
                      </div>
                    </div>
                  </div>

                  <div className="">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                      <FileText size={12} className="text-blue-500" /> Document d'identité
                    </p>
                    <div className="bg-white shadow-sm p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        <InfoField label="Type" value={lastB.typeDoc} />
                        <InfoField label="Référence" value={lastB.referenceDoc} />
                        <InfoField label="Délivrance" value={new Date(lastB.dateDelivranceDoc).toLocaleDateString('fr-FR')} />
                        <InfoField label="Validité" value={new Date(lastB.dateValiditeDoc).toLocaleDateString('fr-FR')} />
                      </div>
                    </div>
                  </div>

                </div>
              </>
            ) : (
              <div className="bg-white shadow-sm p-10 flex flex-col items-center justify-center text-gray-300">
                <User size={32} className="mb-3" />
                <p className="text-sm">Aucun bénéficiaire enregistré.</p>
              </div>
            )}
          </div>

          {/* ── Colonne droite — Pièces jointes ── */}
          <div className="w-72 shrink-0 space-y-5">

            {/* Card pièces jointes */}
            <div className="bg-white border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <FileText size={15} className="text-blue-500" />
                  Pièces jointes
                </h2>
                <span className="text-xs bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full">
                  {client.userDocument.length}
                </span>
              </div>

              {client.userDocument.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-300">
                  <FileText size={28} className="mb-2" />
                  <p className="text-xs">Aucun document.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {client.userDocument.map((doc) => (
                    <DocumentRow key={doc.id} doc={doc} />
                  ))}
                </div>
              )}
            </div>

            {/* Card résumé bénéficiaires */}
            {client.clientBeneficiaireForms.length > 1 && (
              <div className="bg-white border border-gray-100 shadow-sm p-5">
                <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4">
                  <User size={15} className="text-blue-500" />
                  Tous les bénéficiaires
                  <span className="ml-auto text-xs bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full">
                    {client.clientBeneficiaireForms.length}
                  </span>
                </h2>
                <div className="space-y-2">
                  {client.clientBeneficiaireForms.map((b, idx) => (
                    <div
                      key={b.id}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border transition cursor-default ${
                        idx === client.clientBeneficiaireForms.length - 1
                          ? 'border-blue-200 bg-blue-50/50'
                          : 'border-gray-100 hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                        {b.prenom?.[0]}{b.nom?.[0]}
                      </div>
                      <div className="min-w-0">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">Information </p>
                          <p className="font-bold text-gray-900 text-sm">Nom : {b.nom}</p>
                          <p className="font-bold text-gray-900 text-sm">Prenom : {b.prenom}</p>
                          <p className="text-xs text-gray-400">Email : {b.email || '—'}</p>
                        </div>
                      </div>
                      {idx === client.clientBeneficiaireForms.length - 1 && (
                        <span className="ml-auto text-xs text-blue-500 font-semibold shrink-0">Affiché</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
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