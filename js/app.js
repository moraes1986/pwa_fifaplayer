/*
Variáveis Globais
*/
let token = "33783736-f54e-40a2-b1c3-26e45634ac31"
let endpoint_principal = "https://futdb.app/api/";
let data_json = null;
let load_imagem = false;
let cursor = 0;
let limite_paginacao = 20;
let busca = "";
let busca_valor = "";
let container_jogadores = document.getElementById("container_jogadores");
let container_league = document.getElementById("container_league");
let titulo_principal = document.getElementById("titulo_principal");
let carregar_mais = document.getElementById("carregar_mais");
let time = document.getElementById("select_club");
let liga = document.getElementById("select_league");
let buscar_nome = document.getElementById("name");
let tela_consulta = document.getElementById("consulta");
/*

Template Engine

*/

let card_jogador = function (items, league, club, id) {
    return `
            <div class="col-12 col-md-6 col-lg-4">
            <div class="card" id="card_${items.id}">                
                <img id="${id}" src="" class="card-jogador"></img>
                <div class="card-body">
                <h5 class="card-title">${items.name}</h5>
                <h6><strong>Liga: </strong>${league.name}</h6>
                <h6><strong>Time: </strong>${club.name}</h6>
                <h6><strong>Posição: </strong>${items.position}</h6>
                
                </div>
            </div>
        </div>`;
}

/*
Carregar Dados Asssíncronos
*/

document.getElementById("btLogo").addEventListener("click", function () {

    busca = "";
    busca_valor = "";
    cursor = 0;

    container_jogadores.innerHTML = "";

    carregarDados(endpoint_principal + "players", "Lista de Jogadores", titulo_principal, container_jogadores);

});


function getFutebolData(endpoint, async_request) {
    var data_json;
    let ajax = new XMLHttpRequest();
    ajax.open("GET", endpoint, async_request);
    ajax.setRequestHeader("X-AUTH-TOKEN", token);


    //console.log("Request assync: " + async_request)
    ajax.send();

    if (async_request == true) {
        ajax.onreadystatechange = function () {

            if (this.readyState == 4 && this.status == 200) {
                data_json = JSON.parse(this.responseText);
                //console.log("assync request: " + data_json);
            }

        }
    } else {
        data_json = JSON.parse(ajax.responseText);
        //console.log("sync request: " + data_json);
    }


    return data_json;

}

async function getFutebolImg(endpoint, async_request, id) {

    let ajax = new XMLHttpRequest();
    ajax.open("GET", endpoint, async_request);
    ajax.setRequestHeader("X-AUTH-TOKEN", token);
    ajax.setRequestHeader("accept", "image/png");
    ajax.timeout = 8000;

    ajax.responseType = 'blob';

    let blob;
    let image = new Image();
    let tag_img = document.getElementById(id);
    
    setTimeout(() => {
        ajax.send();
        ajax.onreadystatechange = function () {


            if (this.readyState == 4 && this.status == 200) {
                blob = new Blob([ajax.response], { type: "image/png" });
                image.src = URL.createObjectURL(blob);
                tag_img.src = image.src;
                console.log(image.src);
            }
        };
    }, 800);
        
    
}



function carregarDados(endpoint, titulo, container_titulo, container_resultado) {

    var data_json = getFutebolData(endpoint, false);

    //* Preload images for fast loading *//
    let data_json_replace = [];
    var test = 0;

    let html_container;


    if (busca == "") {
        html_container = container_resultado.innerHTML;
        //html_container_league = container_league.innerHTML;

    } else {
        html_container = "";

    }

    let total;
    let pageTotal;
    let currentPage;
    let find = false;
    if (data_json.items.length < cursor + limite_paginacao || busca != "") {
        total = data_json.items.length;
        pageTotal = data_json.pagination.pageTotal;
        currentPage = 1;
    } else {
        total = cursor + limite_paginacao;
    }

    if (busca != "") {
        cursor = 0;
    }

    for (let i = cursor; i < total - test; i++) {
        //zsetTimeout(i,20000);
        if (busca == "name") {

            console.log(data_json);
            nome_base = data_json.items[i].name.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
            busca_valor = busca_valor.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

            if (nome_base.includes(busca_valor) && data_json.items[i].club == time.options[time.selectedIndex].value) {
                find = true;
                load_imagem = false;
                data_json_replace.push(data_json.items[i]);
                console.log(data_json_replace);
                //console.log(data_json.items[i].name);
                //var player_img = getFutebolImg(endpoint_principal+"players/" + data_json.items[i].id +"/image", true);

                let league_json = getFutebolData(endpoint_principal + "leagues/" + data_json.items[i].league, false);

                let club_json = getFutebolData(endpoint_principal + "clubs/" + data_json.items[i].club, false);

                html_container += card_jogador(data_json.items[i], league_json.league, club_json.club, data_json.items[i].id);

            }

            if (i + 1 == data_json.pagination.itemsPerPage && find == false) {
                data_json = "";
                currentPage++;
                console.log(currentPage);
                var data_json = getFutebolData(endpoint + "page=" + currentPage, false);
                i = 0;
            }

        } else {

            //console.log(array_img[i], i);
            let league_json = getFutebolData(endpoint_principal + "leagues/" + data_json.items[i].league, false);
            
            let club_json = getFutebolData(endpoint_principal + "clubs/" + data_json.items[i].club, false);

            html_container += card_jogador(data_json.items[i], league_json.league, club_json.club, data_json.items[i].id);
        }


    }

    //Verificar se é necessário colocar o botão de carregar mais
    cursor += limite_paginacao;

    if (data_json.items.length > cursor) {
        carregar_mais.style.display = "block";
    } else {
        carregar_mais.style.display = "none";
    }

    if (busca != "") {
        carregar_mais.style.display = "none";
    }

    if (busca != "" && html_container == "") {
        html_container = '<div class="alert alert-warning" role="alert">Não foram encontrados jogadores que satisfaçam sua busca!</div>';
    }

    container_resultado.innerHTML = html_container;
    container_titulo.innerHTML = titulo;

    if(load_imagem == false){
        let array_img = [];
        if(data_json_replace != null && data_json.length > 0){
            console.log("recebeu replace image", data_json_replace);
            array_img = data_json_replace;
        }else{
            array_img = data_json.items;
        }
        console.log(array_img);
        for (let i = 0; i < array_img.length - test; i++) {
            let id = array_img[i].id;
            let res = getFutebolImg(endpoint_principal + "players/" + array_img[i].id + "/image",true, id);
            res.then( (response) => {
    
                console.log(response);
            });
    
        }
        load_imagem = true;
    }
    
}

/*
Buscar Jogador
*/

document.getElementById("btPesquisa").addEventListener("click", function () {

    //clube.value = "";
    //league.value = "";
    let data_json_league = getFutebolData(endpoint_principal + "leagues?page=1", false);
    let league = liga;
    //var pageCurrent = data_json_league.pagagination.pageCurrent;

    if (data_json_league.items.length > 0) {
        for (let j = 1; j <= data_json_league.pagination.pageTotal; j++) {

            if (j > 1) {
                data_json_league = "";
                data_json_league = getFutebolData(endpoint_principal + "leagues?page=" + j, false);
            }
            for (let i = 0; i < data_json_league.items.length; i++) {
                console.log(data_json_league.items[i].name);
                league.options[league.options.length] = new Option(data_json_league.items[i].name, data_json_league.items[i].id);

            }

        }
    }
    document.getElementById("name").value = "";

});

var collapseSearch = document.getElementById('collapseSearch')

var bsCollapse = new bootstrap.Collapse(collapseSearch, {
    toggle: false,
    show: true, //useless
    hide: false //useless
})

/* club.addEventListener("change", function(evt){
    console.log(this.value);
    bsCollapse.hide();

    busca = "club";
    busca_valor = this.value;

    carregarDados(endpoint_principal, "Jogadores para o time: "+club.options[club.selectedIndex].text, titulo_principal, container_jogadores);

});*/

liga.addEventListener("change", function () {
    console.log(this.value);
    bsCollapse.hide();


    let data_json_clubs = getFutebolData(endpoint_principal + "clubs?page=1", false);
    let club = time;
    //var pageCurrent = data_json_league.pagagination.pageCurrent;

    if (data_json_clubs.items.length > 0) {
        for (let j = 1; j <= data_json_clubs.pagination.pageTotal; j++) {

            if (j > 1) {
                data_json_clubs = "";
                data_json_clubs = getFutebolData(endpoint_principal + "clubs?page=" + j, false);
            }
            for (let i = 0; i < data_json_clubs.items.length; i++) {
                if (data_json_clubs.items[i].league == liga.options[liga.selectedIndex].value) {
                    console.log(data_json_clubs.items[i].name);
                    club.options[club.options.length] = new Option(data_json_clubs.items[i].name, data_json_clubs.items[i].id);
                }

            }

        }
    }
});


buscar_nome.addEventListener("click", function () {

    let nome_jogador = document.getElementById("name").value;
    if (nome_jogador.length > 2) {
        bsCollapse.hide();

        busca = "name";
        busca_valor = nome_jogador;

        carregarDados(endpoint_principal + "players?page=1", "Jogadores com o nome: " + nome_jogador, titulo_principal, container_jogadores);
    }

});

/*
Carregar Mais Conteudo
*/
function btCarregar() {
    carregarDados(endpoint_principal, "Lista de Jogadores", titulo_principal, container_jogadores);
}


let offset_scroll;


function btVoltar() {
    tela_gastos.style.display = "none";
    tela_consulta.style.display = "block";

    offset_scroll.scrollIntoView({ block: "center", behavior: "instant" });

}



//Inicialização
carregarDados(endpoint_principal + "players", "Lista de Jogadores", titulo_principal, container_jogadores);


/*
Botão de Instalação
*/

let janelaInstalacao = null;
let btInstalar = document.getElementById("btInstalar");

window.addEventListener("beforeinstallprompt", gravarJanela);

function gravarJanela(evt) {
    janelaInstalacao = evt;
}

let inicializaInstalacao = function () {

    setTimeout(function () {

        if (janelaInstalacao != null) {
            btInstalar.removeAttribute("hidden");
        }

    }, 500);

    btInstalar.addEventListener("click", function () {

        btInstalar.setAttribute("hidden", true);
        btInstalar.hidden = true;

        janelaInstalacao.prompt();

        janelaInstalacao.userChoice.then((choice) => {

            if (choice.outcome === 'accepted') {
                console.log("Usuário instalou a aplicação!");
            } else {
                console.log("Usuário NÃO instalou a aplicação!");
                btInstalar.removeAttribute("hidden");
            }

        });

    });


}



