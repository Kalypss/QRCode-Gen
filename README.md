# Générateur de Code QR Avancé

Ce projet est un générateur de code QR moderne, hautement personnalisable, inspiré par l'esthétique de [photogradient.com](https://photogradient.com). Il utilise React, `react-colorful` pour les sélecteurs de couleur, et `shadcn/ui` pour les composants d'interface utilisateur. Vous pouvez personnaliser les couleurs, le rayon des coins, et télécharger votre QR code en PNG ou SVG.

---

## 🚀 Fonctionnalités

- **Personnalisation des couleurs** (arrière-plan et QR)
- **Smart Border Radius** : arrondi intelligent des modules QR
- **Aperçu en temps réel**
- **Téléchargement PNG haute qualité**
- **Téléchargement SVG (fallback)**
- **Interface moderne et responsive**
- **Sélecteur de couleur avancé**
- **Lien direct vers le projet GitHub**

---

## 📦 Installation

```bash
# Clonez le repo
git clone https://github.com/k4lips0/QRCode.git
cd QRCode

# Installez les dépendances
npm install

# Lancez le serveur de développement
npm run dev
```

---

## 🛠️ Utilisation

1. **Entrez votre texte ou URL** dans le champ prévu.
2. **Personnalisez les couleurs** du QR et du fond avec le color picker ou en tapant le code hex.
3. **Ajustez le border radius** avec le slider pour un effet arrondi.
4. **Téléchargez le QR code** en PNG (bouton Download) ou SVG (si PNG échoue).
5. **Accédez au code source** via le lien GitHub en bas à droite.

---

## 📋 Feuille de Route

### Phase 1: Initialisation du Projet et Configuration de Base
- Création du projet React + Vite + TypeScript
- Installation des dépendances (`qrcode`, `react-colorful`, `shadcn/ui`, `tailwindcss`...)

### Phase 2: Structure de l'Interface Utilisateur et Logique de Base
- Mise en page à deux colonnes (QR + contrôles)
- Intégration des composants UI
- Génération QR de base
- Sélecteurs de couleur

### Phase 3: Personnalisation Avancée et Rendu SVG Intelligent
- Rendu SVG personnalisé avec arrondis intelligents
- Slider pour le border radius
- Téléchargement SVG

### Phase 4: Polissage et Améliorations
- Ajustements de style et responsive
- Gestion des erreurs
- Téléchargement PNG fiable

---

## 💡 Notes

- Le bouton Download génère un PNG haute résolution (1024x1024).
- Si le PNG ne peut pas être généré, le fallback est un SVG.
- L'effet d'arrondi personnalisé n'est visible que dans l'aperçu et le SVG.

---

## 🔗 Lien GitHub

[Voir le projet sur GitHub](https://github.com/k4lips0/QRCode)