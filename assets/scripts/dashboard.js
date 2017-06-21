var productObjects = [];
var cart = new Cart();

function Cart(){
  var _this = this;
  
  this.products = [];

  this.addProduct = function(product){
    this.products.push(product)
  }

  this.update = function(){
    this.products = productObjects;
    this.bindDataToDom();
  }

  this.total = function(){
    return _this.products.map(function(product, index){return product.price()}).reduce(function(sum, price){return sum+price});
  }

  this.discount = function(){
    return (_this.products.length <= 3) ? 5 : (_this.products.length > 3 && _this.products.length <= 10) ? 10 : 25
  }

  this.discounted_price = function(){
    return (_this.total() * _this.discount()) / 100 ;
  }

  this.estimated_total = function(){
    return _this.total() - _this.discounted_price();
  }

  this.bindDataToDom = function(){
    $('.cart').find('.subtotal .price').html(formatFloat(_this.total()));
    $('.cart').find('.code-applied > div > span').html(this.discount());
    $('.cart').find('.code-applied  span.price').html('-'+formatFloat(_this.discounted_price()));
    $('.cart').find('.estimated-total span.price').html(formatFloat(_this.estimated_total()));
    $('.cart-products').find('.count').html(_this.products.length);
  }
}

function Product(product){

  var _this = this;

  this.id = product.p_id;
  this.size = product.p_selected_size.code;
  this.qty = product.p_quantity;
  this.price = function(){return this.qty * product.p_price;}
  this.product = product;
  this.$product_item = null;

  this.bindProductDataToDom = function(){
    if(!_this.$product_item)
      _this.$product_item = $('.product-item-template').clone().removeClass('product-item-template hide').addClass('product-item');

    _this.$product_item.attr('product-id', product.p_id);
    _this.$product_item.find('img').attr('src', 'assets/T'+product.p_id+'.jpg');
    _this.$product_item.find('.title').html(product.p_name);
    _this.$product_item.find('.style').html(product.p_style);
    _this.$product_item.find('.color').html(product.p_selected_color.name);
    _this.$product_item.find('.size').html(_this.size);
    _this.$product_item.find('.qty').html(_this.qty);
    _this.$product_item.find('.currency').html(product.c_currency);
    _this.$product_item.find('.price').html(formatFloat(_this.price()));

    if(_this.$product_item.closest('.cart-products').length < 1)
      _this.$product_item.appendTo('.cart-products');
  }
}

var formatFloat = function(value){
  return parseFloat(value).toFixed(2)
}


function getProductOnPageLoad(){
  
  $.ajax({
    url: 'assets/cart.json', 
    method: 'GET',
    dataType: 'json',
    complete: function(data){
      var products = JSON.parse(data.responseText).productsInCart;
      for(i=0; i <  products.length; i++){
        product = new Product(products[i]);
        product.bindProductDataToDom();
        productObjects.push(product)
      }
      
      cart.update();
    }
  });

}



$(function(){
  getProductOnPageLoad();

  $('body').on('click', '.product-item .edit', function(){
     $itemModal = $('#ItemModal');
     product_id = $(this).closest('.product-item').attr('product-id');
     productObject = productObjects.filter(function(product){ return product.id == product_id})[0]
     $itemModal.attr('product-id', productObject.id);
     $itemModal.find('.title').html(productObject.product.p_name);
     $itemModal.find('.price').html(productObject.product.p_price);
     $itemModal.find('img').attr('src', 'assets/T'+productObject.product.p_id+'.jpg');
  });


  $('body').on('click', '#ItemModal .edit', function(){
     $itemModal = $(this).closest('#ItemModal');
     product_id = $(this).closest('#ItemModal').attr('product-id');
     productObject = productObjects.filter(function(product){ return product.id == product_id})[0];

     productObject.size = $itemModal.find('.size > select > option:selected').val();
     productObject.qty = parseInt($itemModal.find('.qty > select > option:selected').val());
     productObject.bindProductDataToDom();
     cart.update();
  });
})
