// imposto OPENAI
const OPENAI = {
    API_BASE_URL: 'https://api.openai.com/v1',
    API_KEY: '', // inserisci qui la chiave
    GPT_MODEL: 'gpt-3.5-turbo',
    API_COMPLETIONS: '/chat/completions',
    API_IMAGE: '/images/generations'
};

const ingredients = document.querySelectorAll('.ingrediente');
const bowlSlots = document.querySelectorAll('.parte-tazza');
const cookBtn = document.querySelector('#cucina-btn');
const loading = document.querySelector('.carico');
const loadingMessage = document.querySelector('.avviso-carico');
const modal = document.querySelector('.modale');
const modalContent = document.querySelector('.nel-modale');
const modalImage = document.querySelector('.modale-img');
const modalCloseBtn = document.querySelector('.chiudi-modale');

let bowl = [];

cookBtn.addEventListener('click', creaRicetta);

ingredients.forEach(function (el) {
    el.addEventListener('click', function () {
        mettiIngrediente(el.innerText);
    });
});

modalCloseBtn.addEventListener('click', function () {
    modal.classList.add('invisibile');
    cookBtn.classList.add('invisibile');

});

// sezione FUNZIONI
function mettiIngrediente(ingrediente) {
    const bowlMaxSlots = bowlSlots.length;

    if (bowl.length === bowlMaxSlots) {
        bowl.shift();
    }

    bowl.push(ingrediente);

    bowlSlots.forEach(function (el, i) {
        let ingrediente = '?';

        if (bowl[i]) {
            ingrediente = bowl[i];
        }

        el.innerText = ingrediente;
    });

    if (bowl.length === bowlMaxSlots) {
        cookBtn.classList.remove('invisibile');
    }
}

async function creaRicetta() {
    // console.log(bowl)
    loading.classList.remove("invisibile");
    loadingMessage.innerText = messaggiCaricamento();

    const messageInterval = setInterval(() => {
        loadingMessage.innerText = messaggiCaricamento();
    }, 2000);

    const prompt = `/
    Crea una ricetta con questi ingredienti: ${bowl.join(', ')}.
La ricetta deve essere facile e con un titolo creativo e divertente.
Le tue risposte sono solo in formato JSON come questo esempio:

###

{
    "titolo": "Titolo ricetta",
    "ingredienti": "1 uovo e 1 pomodoro",
    "istruzioni": "mescola gli ingredienti e metti in forno"
}

###`;

    const responsoRicetta = await inviaRichiesta(OPENAI.API_COMPLETIONS, {
        model: "gpt-3.5-turbo",
        messages: [{
            role: "user",
            content: prompt,
        }],
    });
    // console.log(responsoRicetta);
    const ricetta = JSON.parse(responsoRicetta.choices[0].message.content);

    loading.classList.add("invisibile");
    modal.classList.remove("invisibile");
    clearInterval(messageInterval);

    modalContent.innerHTML = `\
    <h2>${ricetta.titolo}</h2>
    <p>${ricetta.ingredienti}</p>
    <p>${ricetta.istruzioni}</p>`;

    //console.log(ricetta);

    const immagineGenerata = await inviaRichiesta(OPENAI.API_IMAGE, {
        prompt: ricetta.titolo,
        n: 1,
        size: "512x512",
    });

    const collImg = immagineGenerata.data[0].url;
    modalImage.innerHTML = `<img src="${collImg}" alt="foto ricetta" />`;

    svuotaTazza();
}

function svuotaTazza() {
    bowl = [];

    bowlSlots.forEach(function (slot) {
        slot.innerText = "?";
    });
}

async function inviaRichiesta(endpoint, payload) {
    const response = await fetch(OPENAI.API_BASE_URL + endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI.API_KEY}`
        },
        body: JSON.stringify(payload)
    });

    const json = await response.json();
    return json;
}

function messaggiCaricamento() {
    const messages = [
        'Preparo gli ingredienti...',
        'Scaldo i fornelli...',
        'Mescolo nella ciotola...',
        'Scatto foto per Instagram...',
        'Prendo il mestolo...',
        'Metto il grembiule...',
        'Mi lavo le mani...',
        'Tolgo le bucce...',
        'Pulisco il ripiano...'
    ];

    const randIdx = Math.floor(Math.random() * messages.length);
    return messages[randIdx];
}
