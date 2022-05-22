(function(){
  "use strict";

  // Fonction d'appel de requête à l'API qui retourne un tableau contenant tous les produits
  const getProducts = async function(){
    try{
      let response = await fetch('http://localhost:3000/api/products/');
      if (response.ok){
        let products = await response.json();
        run(products);                          // Parcourir le tableau "produits"
        refreshCounterCartToHTML();             // Actualiser le compteur du panier
      }
      else{
        console.error('Error - HTTP code status: ', response.status);
      }
    } catch (e){
      console.log('Fetch problem: ' + e.message);
    }
  
    // Parcourir le tableau "produits"
    function run(arrayProducts){
      let product;

      // On parcourt le tableau des produits
      for (let i=0; i<arrayProducts.length; i++){
        product = arrayProducts[i];
        // Pour chaque produit on ajoute un article au HTML
        addArticleToHTML(product);
      }

      // Ajouter un article au HTML pour chaque produit.
      function addArticleToHTML(product){
        const sectionItems = document.querySelector("#items");

        // Lorsque l'on clique sur un article => redirection vers page product avec l'id du produit dans l'URL
        sectionItems.innerHTML +=   `<a href="./product.html?id=${product._id}">
                                        <article>
                                          <img src="${product.imageUrl}" alt="${product.altTxt}">
                                          <h3 class="productName">${product.name}</h3>
                                          <p class="productDescription">${product.description}</p>
                                        </article>
                                    </a>`;
      }
    }
  }

  getProducts(); // On fait une requête à l'API qui retourne un tableau contenant tous les produits

})();

