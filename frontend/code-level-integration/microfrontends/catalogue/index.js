$('#catalogue').append(`
  <div class="row" id="catalogue-products"></div>
`);

$.ajaxSetup({
  contentType: 'application/json; charset=utf-8',
  xhrFields: {
    withCredentials: true,
  },
});

$(document).ready(() => {
  $.getJSON('http://localhost:8080/catalogue', function (data) {
    if (data != null) {
      $.each(data, function (index, element) {
        $('#catalogue-products').append(
          `<div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <a href="#">
                <img class="card-img-top" src="http://localhost:8080${element.imageUrl[0]}" />
              </a>
              <div class="card-body">
                <h4 class="card-title">
                  <a href="#">${element.name}</a>
                </h4>
                <h5>${element.price}</h5>
                <p class="card-text">${element.description}</p>
              </div>
              <div class="card-footer text-right">
                <button type="button" class="btn btn-primary"
                  onclick="return catalogue_addToCart('${element.id}', '${element.name}', '${element.price}')">
                    Add to cart
                </button>
              </div>
            </div>
          </div>
        `
        );
      });
    }
  });
});

function catalogue_addToCart(productId, productName, productPrice) {
  $('#carts').trigger('carts:add-product-to-cart', [
    {
      id: productId,
      name: productName,
      price: productPrice,
    },
  ]);
}
