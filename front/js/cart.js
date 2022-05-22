(function(){
  "use strict";

  let productsCart = getProductsCart();   // Produits du panier
  loadPageCart(productsCart);             // Charger la page panier en affichant les produits
  toOrder();                              // Passer une commande
  loadOrderForm();                        // Obtenir les données du formulaire via le sessionStorage

  // Obtenir un tableau des produits du panier en provenance du localStorage
  function getProductsCart(){
    const productsLocalStorage = localStorage.getItem("productsCart");
    let productsCart = [];
    if(productsLocalStorage){
        productsCart = JSON.parse(productsLocalStorage);
    }
    return productsCart;
  }
  
  // Charger la page panier en affichant les produits
  function loadPageCart(productsCart){
    add(productsCart);                    // Ajout des produits du localStorage sur la page panier
    update_afterDeletedProduct();         // Mise à jour apres suppression d'un produit
    update_afterModifiedQuantity();       // Mise à jour apres modification de la quantité d'un produit
    updateAmountTotalCart();              // Mise à jour du montant total du panier
    refreshCounterCartToHTML();           // Mise à jour du compteur panier
    manageOrderForm();                    // Gérer le formulaire de commande

    // Ajout des produits du localStorage sur la page panier
    function add(arrayItems){
      let item;
      if (arrayItems.length != 0){
        for (let i=0; i<arrayItems.length; i++){
          item = arrayItems[i];
          addToHTML(item);
        }
      }else{
        displayMessage_cartIsClear();
      }

      // Ajouter un article au HTML
      function addToHTML(item){
        const cartItems = document.querySelector("#cart__items");
        cartItems.innerHTML +=   `<article class="cart__item" data-id="${item.id}" data-color="${item.color}">
                                    <div class="cart__item__img">
                                      <img src="${item.imageUrl}" alt="${item.altTxt}">
                                    </div>
                                    <div class="cart__item__content">
                                      <div class="cart__item__content__description">
                                        <h2>${item.nameProduct}</h2>
                                        <p>${item.color}</p>
                                        <p>${item.price * item.quantity} €</p>
                                      </div>
                                      <div class="cart__item__content__settings">
                                        <div class="cart__item__content__settings__quantity">
                                          <p>Qté : </p>
                                          <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${item.quantity}">
                                        </div>
                                        <div class="cart__item__content__settings__delete">
                                          <p class="deleteItem">Supprimer</p>
                                        </div>
                                      </div>
                                    </div>
                                  </article>`;
      }

      // Afficher message: votre panier est vide
      function displayMessage_cartIsClear(){
        const cartItems = document.querySelector("#cart__items");
        cartItems.innerHTML +=   `<p>Votre panier est vide</p>`;
      }
    }

    // Effectuer les mises à jour apres suppression d'un produit
    function update_afterDeletedProduct(){
      let listElements_delete= document.querySelectorAll(".deleteItem");
      for(let i=0; i<listElements_delete.length; i++){
        listElements_delete[i].addEventListener("click", (event)=>{
          // On récupère l'index du produit à supprimer
          let product = productsCart[i];
          let index = getIndex_deletedProduct(product);

          // On récupère la quantité du produit supprimé
          let currentQuantityProduct = getQuantity_currentProduct(index);

          // On supprime le produit à l'index défini
          productsCart.splice(index, 1);

          // on met à jour le productsCart du localStorage
          updateProductsCart();

          //On met a jour le compteur du panier apres suppression d'un produit
          updateCounterCart_afterDelete(currentQuantityProduct);

          // On supprime le localStorage lorsqu'il n'y plus de produits dans le panier
          if(productsCart.length === 0){
            removeLocalStorage();
          }

          // Suppression des articles dans le HTML et Rechargement de la page
          let listArticle_delete = document.querySelector("#cart__items");
          listArticle_delete.innerHTML = "";
          loadPageCart(productsCart);
        })
      }

      // Obtenir l'index du produit à supprimer
      function getIndex_deletedProduct(product){
          // parametre à prendre en compte pour la suppression d'un produit
          const id = (element) => element.id === product.id;
          const color = (element) => element.color === product.color;

          //On cible le produit à supprimer selon l'id et la couleur
          let indexDeletedProduct = productsCart.findIndex(id && color);
          return indexDeletedProduct;
      }

      // Récupérer la quantité du produit courant
      function getQuantity_currentProduct(index){
        return productsCart[index].quantity;
      }

      // Mettre à jour le compteur du panier apres suppression d'un produit
      function updateCounterCart_afterDelete(currentQuantityProduct){
        let currentCounterCart = getCounterCart();
        localStorage.setItem("counterCart", currentCounterCart - currentQuantityProduct);

        // Obtenir le compteur du panier à partir du localStorage
        function getCounterCart(){
          const counterCartLocalStorage = localStorage.getItem("counterCart");
          return counterCartLocalStorage;
        }
      }

      // Suppression des produits du panier et du compteur de panier dans le localStorage
      function removeLocalStorage(){
        localStorage.removeItem("productsCart");
        localStorage.removeItem("counterCart");
      }
    }

    // Mise à jour apres modification de la quantité d'un produit
    function update_afterModifiedQuantity(){
      let listElements_quantity= document.querySelectorAll(".itemQuantity");
      
      for(let i=0; i<listElements_quantity.length; i++){
        listElements_quantity[i].addEventListener("click", (event)=>{
         let gapQuantity = listElements_quantity[i].value - productsCart[i].quantity;
         productsCart[i].quantity = listElements_quantity[i].value;
 
         let counterCart = Number(localStorage.getItem("counterCart"));
         updateCounterCart(counterCart, gapQuantity);
         updateProductsCart();
         refreshPriceProduct(productsCart, i);
         updateAmountTotalCart();
        })
      }
 
     //Met à jour le compteur du panier lorsque l'on modifie la quantité d'un produit
     function updateCounterCart(currentCounterCart, gapQuantity){
       localStorage.setItem("counterCart", currentCounterCart + gapQuantity);
       refreshCounterCartToHTML();
     }
 
     // Mettre à jour le prix du produit selon sa quantité
     function refreshPriceProduct(productsCart, i){
       const item = productsCart[i];
       const article = document.querySelector(`.cart__item:nth-child(${i+1})`);
       const price = article.querySelector(".cart__item__content__description p:nth-child(3)");
       price.innerHTML = `<p>${item.price * item.quantity} €</p>`;
     }
    }

    // Mettre à jour le montant total du panier
    function updateAmountTotalCart(){
      let listElements_quantity= document.querySelectorAll(".itemQuantity");
      let totalAmount = 0;
      
      for(let i=0; i<listElements_quantity.length; i++){
        totalAmount += productsCart[i].price * productsCart[i].quantity;
      }
      refreshTotalAmountToHTML(totalAmount);

      // Mettre à jour le montant total des produits dans le HTML
      function refreshTotalAmountToHTML(totalAmount){
        let counterCart = localStorage.getItem("counterCart");
        const totalArticle_paragraphe = document.querySelector(".cart__price p");
    
        if (counterCart != null){
          if(counterCart > 1){
            totalArticle_paragraphe.innerHTML = `Total (<span id="totalQuantity">${counterCart}</span> articles) : <span id="totalPrice">${totalAmount}</span> €`;
          }else{
            totalArticle_paragraphe.innerHTML = `Total (<span id="totalQuantity">${counterCart}</span> article) : <span id="totalPrice">${totalAmount}</span> €`;
          }
        }else{
          totalArticle_paragraphe.innerHTML = `Total (<span id="totalQuantity">0</span> article) : <span id="totalPrice">0</span> €`;
        }
      }
    }

    // Gestion du formulaire de commande
    function manageOrderForm(){
      const firstName = document.querySelector("#firstName");
      const lastName = document.querySelector("#lastName");
      const address= document.querySelector("#address");
      const city= document.querySelector("#city");
      const email = document.querySelector("#email");

      firstName.addEventListener('input', loadForm);
      lastName.addEventListener('input', loadForm);
      address.addEventListener('input', loadForm);
      city.addEventListener('input', loadForm);
      email.addEventListener('input', loadForm);

      // Charger le formulaire de commande
      function loadForm(){
        const orderForm = {
          firstName:document.querySelector("#firstName").value,
          lastName:document.querySelector("#lastName").value,
          address:document.querySelector("#address").value,
          city:document.querySelector("#city").value,
          email:document.querySelector("#email").value
        }
  
        // On supprime tous les messages d'erreur
        removeALLMessagesValidation();
        manageValidationMessage(orderForm);
        addOrderForm_sessionStorage();
      }
      
      // Si tous les champs du formulaire sont rempli on sauvegarde l'ensemble du formulaire dans le sessionStorage
      function addOrderForm_sessionStorage() {
        if(firstName.value != null && lastName.value != null && address.value != null && city.value != null && email.value != null){
          const orderForm = {
            firstName:firstName.value,
            lastName:lastName.value,
            address:address.value,
            city:city.value,
            email:email.value
          }
          sessionStorage.setItem("orderForm", JSON.stringify(orderForm));
        }
      }
    }

    // Mettre à jour le productsCart du localStorage
    function updateProductsCart(){
      localStorage.setItem("productsCart", JSON.stringify(productsCart));
    }
  }

  // Passer une commande
  function toOrder(){
    const btnSendOrder = document.querySelector("#order");
    btnSendOrder.addEventListener("click", (e)=>{
      e.preventDefault();
      // On crée un objet formulaire de commande
      const orderForm = createOrderForm();

      // On supprime tous les messages d'erreur
      removeALLMessagesValidation();

      // On vérifie la validation de tous les champs
      if(name_validation(orderForm.firstName) && name_validation(orderForm.lastName) &&
      name_validation(orderForm.city) && address_validation(orderForm.address) && email_validation(orderForm.email)){
        if(productsCart.length != 0){
          const products = getArrayIdProducts(productsCart);
          let contact = new Contact(orderForm.firstName, orderForm.lastName, orderForm.address,
                                      orderForm.city, orderForm.email);
          const orderProducts = {
              contact,
              products
          }
          post('http://localhost:3000/api/products/order', orderProducts);

          // Obtenir un tableau avec les id de chaque produit du panier
          function getArrayIdProducts(productsCart){
            const productsId = productsCart.map(function(element){
                return element.id;
            });
            return productsId;
          }

          // Objet contact necessaire pour la requête post lorsque l'on passe la commande
          function Contact(firstName, lastName, address, city, email) {
            this.firstName = firstName;
            this.lastName  = lastName;
            this.address   = address;
            this.city      = city;
            this.email     = email;
          }

          // Etablir une requête POST à l'API qui nous retourne un numéro de commande dans l'URL sur la page confirmation
          function post(url, orderProducts) {
            const init = { method: 'POST',
                        body: JSON.stringify(orderProducts),
                        headers:{
                            "Content-Type":"application/json"}
                      };
            fetch(url, init).then(function(res) {
                if (res.ok) {
                    return res.json();
                }
            }).then(function(value) {
                const responseOrder = value;
                window.location = `confirmation.html?orderId=${responseOrder.orderId}`;
            }).catch(function(err) {
                console.log('Fetch problem: ' + err.message);
            });
          }
        }
      }else{
        manageValidationMessage(orderForm);
      }
    })

    // Création d'un formulaire de commande
    function createOrderForm(){
      const form = {
        firstName:document.querySelector("#firstName").value,
        lastName:document.querySelector("#lastName").value,
        address:document.querySelector("#address").value,
        city:document.querySelector("#city").value,
        email:document.querySelector("#email").value
      }
      return form;
    }
  }
  
  // Charger les données du formulaire de commande à partir du sessionStorage
  function loadOrderForm(){
    const orderForm = JSON.parse(sessionStorage.getItem("orderForm"));
    if(orderForm){
      document.querySelector("#firstName").value = orderForm.firstName;
      document.querySelector("#lastName").value = orderForm.lastName;
      document.querySelector("#address").value = orderForm.address;
      document.querySelector("#city").value = orderForm.city;
      document.querySelector("#email").value = orderForm.email;
    }
  }

  // Gérer les messages de validation
  function manageValidationMessage(orderForm){
    if(!name_validation(orderForm.firstName)){
      addMessageValidation("firstName");
    }
    if(!name_validation(orderForm.lastName)){
      addMessageValidation("lastName");
    }
    if(!address_validation(orderForm.address)){
      addMessageValidation("address");
    }
    if(!name_validation(orderForm.city)){
      addMessageValidation("city");
    }
    if(!email_validation(orderForm.email)){
      addMessageValidation("email");
    }

    // Ajouter un message de validation selon le champs
    function addMessageValidation(value){
      switch (value) {
          case 'firstName':
            addMessageValidationToHTML("#firstNameErrorMsg", "prénom");
            break;
          case 'lastName':
            addMessageValidationToHTML("#lastNameErrorMsg", "nom");
            break;
          case 'address':
            addMessageValidationToHTML("#addressErrorMsg", "adresse");
            break;
          case 'city':
            addMessageValidationToHTML("#cityErrorMsg", "ville");
            break;
          case 'email':
            addMessageValidationToHTML("#emailErrorMsg", "email");
            break;
      }

      // Ajouter un message d'erreur au HTML
      function addMessageValidationToHTML(idValidation, field){
        const validation = document.querySelector(idValidation);
        validation.innerText = `${field} invalide`;
      }
    }
  }

  // Suppression tous les messages d'erreur
  function removeALLMessagesValidation(){
    removeMessageValidationToHTML("#firstNameErrorMsg");
    removeMessageValidationToHTML("#lastNameErrorMsg");
    removeMessageValidationToHTML("#addressErrorMsg");
    removeMessageValidationToHTML("#cityErrorMsg");
    removeMessageValidationToHTML("#emailErrorMsg");

    // Suppression de tous les messages d'erreur dans le HTML
    function removeMessageValidationToHTML(idValidation){
      const validation = document.querySelector(idValidation);
      validation.innerHTML = "";
    }
  }

  // Validation d'un champ
  function name_validation(field){
    let field_isValid = false;
    if(/^[A-Za-zàáâãäåçèéêëìíîïðòóôõöùúûüýÿ' -]{2,50}$/.test(field)){
        field_isValid = true;
    }
    return field_isValid
  }

  // Validation d'une adresse
  function address_validation(field){
    let field_isValid = false;
    if(/^[A-Za-z0-9àáâãäåçèéêëìíîïðòóôõöùúûüýÿ' -]{2,50}$/.test(field)){
        field_isValid = true;
    }
    return field_isValid
  }

  //Validation d'un email
  function email_validation(field){
      let field_isValid = false;
      if(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(field)){
          field_isValid = true;
      }
      return field_isValid
  }

})();