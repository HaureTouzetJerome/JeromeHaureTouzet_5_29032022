// On récupère l'id de la commande à partir de l'url
function getIdOrder(){
  const str = document.location.href;
  const url = new URL(str);
  return url.searchParams.get("orderId");
}

// On insère l'id de la commande dans le HTML
function addIdOrderToHTML(orderId){
  const orderId_span = document.querySelector("#orderId");
  orderId_span.innerText = orderId;
}

// On supprime le localStorage
function deleteLocalStorage(){
  localStorage.removeItem("productsCart");
  localStorage.removeItem("orderForm");
  localStorage.removeItem("counterCart");
}

const orderId = getIdOrder();
addIdOrderToHTML(orderId);
deleteLocalStorage();
