(function(){
  "use strict";

  // Récupération de l'id du produit via l'URL
  const URLQueryString = window.location.search;
  const URLSearchParam = new URLSearchParams(URLQueryString);
  const idProduct = URLSearchParam.get("id");

  // Requête à l'API qui retourne les propriétés d'un produit: 
  async function getProduct(idProduct){
    try{
      let response = await fetch(`http://localhost:3000/api/products/${idProduct}`);
      if (!response.ok){
        throw ("Error - HTTP code status:" + response.status); // on lève une exception
      }
      else{
        const propertyProduct = await response.json();        // propriétés d'un produit => altTxt, un tableau 'colors', description, imageUrl,
                                                              //                            name, price, _id
        
        addProductToHTML(propertyProduct);                    // Ajouter un produit au HTML
        addProductToCart(propertyProduct);                    // Ajouter un produit au panier
        refreshCounterCartToHTML();
      }
    } catch (e){
      console.log('Fetch problem: ' + e.message);
    }

    // Ajouter les détails d'un produit au HTML
    function addProductToHTML(propertyProduct){
      addImageProductToHTML(propertyProduct);           // Ajout de l'image
      addNameProductToHTML(propertyProduct);            // Ajout du nom
      addPriceProductToHTML(propertyProduct);           // Ajout du prix
      addDescriptionProductToHTML(propertyProduct);     // Ajout de la description
      addColorsProductToHTML(propertyProduct);          // Ajout de la liste de couleur

      // Ajouter l'image d'un produit au HTML
      function addImageProductToHTML(propertyProduct){
        const itemImg = document.querySelector(".item__img");
        const img = document.createElement("img");
        img.setAttribute("src", propertyProduct.imageUrl);
        img.setAttribute("alt", propertyProduct.altTxt);
        itemImg.appendChild(img);
      }

      // Ajouter le nom d'un produit au HTML
      function addNameProductToHTML(propertyProduct){
        const ItemName = document.querySelector(".item__content__titlePrice #title");
        ItemName.innerText = propertyProduct.name;
      }

      // Ajouter le prix d'un produit au HTML
      function addPriceProductToHTML(propertyProduct){
        const ItemPrice = document.querySelector(".item__content__titlePrice #price");
        ItemPrice.innerText = propertyProduct.price;
      }

      // Ajouter la description d'un produit au HTML
      function addDescriptionProductToHTML(propertyProduct){
        const ItemDescription = document.querySelector(".item__content__description #description");
        ItemDescription.innerText = propertyProduct.description;
      }

      // Ajouter la liste des couleurs d'un produit au HTML
      function addColorsProductToHTML(propertyProduct){
        for (let i = 0; i < propertyProduct.colors.length; i++) {
          const option = document.createElement("option");
          option.setAttribute("value",`${propertyProduct.colors[i]}`);
          option.textContent = propertyProduct.colors[i];
          colors.appendChild(option);
        }
      }
    }

    // Ajouter un produit au panier
    function addProductToCart(propertyProduct){
      const btnAddToCart = document.querySelector("#addToCart");    // Bouton Ajouter au panier
  
      //Lorsque l'on clique sur le bouton 'Ajouter au panier'
      btnAddToCart.addEventListener("click", (event)=>{
  
        const color = getColorSelected();                       // Option de couleur choisie
        const quantity = getQuantitySelected();                 // Quantité choisie
        const selectProduct = createProduct(propertyProduct);   // Création du produit avec ses propriétés sélectionnés en mémoire
        saveDataProductToLocalStorage();                        // On stock les données du produit dans le localStorage
        refreshDefaultValueAfterAddToCart();                    // Recharger valeur par défaut apres ajout au panier
        addToCounterCart(selectProduct);                        // Ajouter produits au compteur du panier
        
        // Obtenir la couleur du produit qui est sélectionnée
        function getColorSelected(){
          const optionColors = document.querySelector(".item__content__settings__color #colors");
          return optionColors.value;
        }

        // Obtenir la quantité du produit qui est sélectionné
        function getQuantitySelected(){
          const quantity = document.querySelector(".item__content__settings__quantity #quantity");
          const selectQuantity = parseInt(quantity.value);
          return selectQuantity;
        }

        // Création d'un objet produit en mémoire
        function createProduct(propertyProduct){
          const selectProduct = {
            id:propertyProduct._id,
            nameProduct:propertyProduct.name,
            description:propertyProduct.description,
            imageUrl:propertyProduct.imageUrl,
            altTxt:propertyProduct.altTxt,
            color:color,
            quantity:quantity,
            price:propertyProduct.price
          }
          return selectProduct;
        }

        // Sauvegarder les données du produit dans le localStorage
        function saveDataProductToLocalStorage(){
          // Vérifier si un produit possède une couleur et une quantité sélectionnés
          if (selectedProductHasColorAndQuantity()){
            const productsLocalStorage = localStorage.getItem("productsCart");
            let productsCart = [];

            // S'il existe des produits dans le localStorage
            if(productsLocalStorage){
              productsCart = JSON.parse(productsLocalStorage); // reforme l’objet à partir de la chaîne linéarisée.
              let indexProduct = indexProductHasSameIdAndColor(productsCart, selectProduct);

              if(productExists()){
                productsCart[indexProduct].quantity += selectProduct.quantity;
              }else{
                productsCart.push(selectProduct);
              }

              // Retourne l'index du produit du localStorage qui possède le même id ainsi que la même couleur que le produit sélectionné
              function indexProductHasSameIdAndColor(productsCart, selectProduct){
                const idIdentic = (element) => element.id === selectProduct.id;
                const colorIdentic = (element) => element.color === selectProduct.color;
                let indexProduct = productsCart.findIndex(idIdentic && colorIdentic);
                return indexProduct;
              }

              // Retourne True si le produit existe
              function productExists(){
                let existingProduct = false;
                indexProduct != -1 ? existingProduct = true : existingProduct = false;
                return existingProduct;
              }
            }
            // Sinon on ajoute le produit au tableau
            else{
                productsCart.push(selectProduct);   
            }
            // On sauvegarde les produits dans le localStorage à partir du tableau 'productsCart'
            localStorage.setItem("productsCart", JSON.stringify(productsCart)); // Transforme l’objet en une chaîne de caractères.
          }

          // Retourne True si le produit sélectionné possède une couleur ainsi qu'une quantité
          function selectedProductHasColorAndQuantity(){
            return (selectProduct.color != "" && selectProduct.quantity != 0 ? true : false);
          }
        }

        // Recharger les valeurs par défaut apres l'ajout au panier
        function refreshDefaultValueAfterAddToCart(){
          let selectDefault_color = document.getElementById("colors");
          selectDefault_color.selectedIndex = 0;
          document.getElementById('quantity').value = 0;
        }
      
        // Ajouter la quantité des produits au compteur du panier
        function addToCounterCart(selectProduct){
          let counterCart = Number(localStorage.getItem("counterCart"));
          counterCart += selectProduct.quantity;
          localStorage.setItem("counterCart", JSON.stringify(counterCart));
          refreshCounterCartToHTML();
        }
      });
    }
  }

  getProduct(idProduct);
})();
