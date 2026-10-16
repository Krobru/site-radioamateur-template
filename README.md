# 📡 Site radioamateur — modèle gratuit

Modèle de site personnel pour radioamateur ou club, issu du site de **ON5EE** (https://on5ee.be).
Gratuit, sans publicité, **sans traceur ni cookie**, sans base de données, sans photo. Hébergement gratuit sur **GitHub Pages**.

Contenu : page d'accueil façon transceiver rétro (VFO, S-mètre, PTT CW, easter egg « CQ »), bascule **FR/EN** (français par défaut), station, relais, outils (locator, Morse), **carte QSL interactive + demande d'e-QSL**, formulaire de contact, bouton de don PayPal, mentions légales, articles APRS et packet radio.

> Toutes vos informations se trouvent dans **un seul fichier : `config.js`**. Pas besoin de savoir coder.

---

## Pas à pas (sans savoir coder)

### 1. Créer un compte GitHub
Allez sur https://github.com/signup et créez un compte gratuit. Votre pseudo apparaîtra dans l'adresse du site (`https://pseudo.github.io/...`).

### 2. Copier le modèle
En haut de cette page, cliquez sur le bouton vert **Use this template → Create a new repository**
(ou sur **Fork** si le bouton n'apparaît pas).
- *Repository name* : par exemple votre indicatif en minuscules (`on0xxx`).
- Choisissez **Public**, puis **Create repository**.

### 3. Mettre vos informations dans `config.js`
1. Dans **votre** dépôt, cliquez sur le fichier `config.js`, puis sur l'icône ✏️ (*Edit this file*).
2. Remplacez les valeurs **entre guillemets** : indicatif, ancien indicatif, prénom, locator, e-mail, adresse du site, lien PayPal, club, relais, liste du matériel (`STATION`).
   - Gardez les guillemets `"..."` et les virgules en fin de ligne.
   - Les fréquences s'écrivent avec un **point** : `438.750`.
3. Cliquez sur **Commit changes…** puis **Commit changes**.

Pour supprimer une section (par ex. le relais si vous n'en gérez pas, ou l'ancien indicatif) : ouvrez `index.html` avec ✏️, cherchez la section (`<section id="relais">`) et supprimez-la jusqu'au `</section>` correspondant. Pour retirer aussi le lien dans le menu, supprimez la ligne `<li><a href="#relais"...`.

### 4. Mettre le site en ligne (GitHub Pages)
1. Dans votre dépôt : **Settings → Pages**.
2. *Source* : **Deploy from a branch** ; *Branch* : **main** et **/ (root)** → **Save**.
3. Après 1 à 2 minutes, l'adresse s'affiche en haut : `https://pseudo.github.io/nom-du-depot/`.
4. Reportez cette adresse dans `config.js` (`SITE_URL` et `DOMAIN`).

### 5. Activer les formulaires (FormSubmit)
Les formulaires de contact et de QSL utilisent le service gratuit [FormSubmit](https://formsubmit.co), qui envoie les messages à l'adresse `EMAIL` de `config.js`.
1. Ouvrez votre site en ligne et envoyez-vous **un premier message** via le formulaire de contact.
2. FormSubmit vous envoie un e-mail **« Activate Form »** : cliquez sur le lien (regardez aussi dans les spams).
3. C'est tout : les messages suivants arrivent directement dans votre boîte.

> Si vous changez d'adresse e-mail plus tard, il faudra refaire cette activation.

### 6. (Facultatif) Votre propre nom de domaine
1. Achetez un domaine (OVH, Gandi, etc.), par ex. `on0xxx.be`.
2. Dans **Settings → Pages → Custom domain**, entrez le domaine et enregistrez (GitHub crée un fichier `CNAME`).
3. Chez votre registrar, dans la zone DNS :
   - 4 enregistrements **A** sur le domaine : `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - (facultatif) 4 **AAAA** : `2606:50c0:8000::153` à `2606:50c0:8003::153`
   - **CNAME** `www` → `pseudo.github.io.`
4. Attendez la propagation (de quelques minutes à quelques heures), puis cochez **Enforce HTTPS**.
5. Mettez `SITE_URL` et `DOMAIN` à jour dans `config.js`.

### 7. Adapter les mentions légales ⚠️
Ouvrez `mentions-legales.html` et **relisez-le entièrement** : vous devenez l'éditeur et le responsable du traitement des données (RGPD). Vérifiez le pays, les services utilisés (FormSubmit, PayPal), la source des données du relais (on0.be) et retirez ce qui ne vous concerne pas. Ce modèle n'est pas un avis juridique.

---

## Bon à savoir
- **Pas de photo** incluse ; si vous en ajoutez, utilisez uniquement vos propres images.
- La langue choisie par le visiteur est mémorisée en `localStorage` (pas de cookie).
- L'émission sur les bandes amateurs reste soumise à votre licence (IBPT en Belgique).
- Langue : textes FR dans le HTML, traduction EN dans les attributs `data-en="..."`.

## Licence
Code sous licence **MIT** (voir `LICENSE`). Merci de **conserver la mention « modèle par ON5EE »** en pied de page.
Les textes des articles sont fournis tels quels ; vérifiez-les et adaptez-les.

---

## English (short)
Free ham radio website template (FR/EN, no trackers/cookies). Click **Use this template**, edit **`config.js`** on github.com, enable **Settings → Pages** (branch `main`, root), send one message through the form to activate **FormSubmit**, optionally add a custom domain (A records to GitHub Pages IPs, `www` CNAME), and **review the legal notice** (`mentions-legales.html`). MIT licence — please keep the “template by ON5EE” credit.
