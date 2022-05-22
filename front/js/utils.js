// Mettre à jour le compteur du panier dans le HTML
function refreshCounterCartToHTML(){
  let counterCart = localStorage.getItem("counterCart");
  if(counterCart != null){
    const cartNav= document.querySelector("nav ul > a:nth-child(2) > li");
    cartNav.innerText = "Panier (" + counterCart + ")";
  }else{
    const cartNav= document.querySelector("nav ul > a:nth-child(2) > li");
    cartNav.innerText = "Panier";
  };
}