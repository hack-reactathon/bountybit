$(document).ready(function() {


  $('#toggle-wallet-box').on('click', function() {
    $(this).closest('.row').find('a').removeClass('active');
    $(this).addClass('active');
    $('#place-bounty-box').hide();
    $('#add-wallet-box').fadeIn(200);
  });

  $('#toggle-bounty-box').on('click', function() {
    $(this).closest('.row').find('a').removeClass('active');
    $(this).addClass('active');
    $('#add-wallet-box').hide();
    $('#place-bounty-box').fadeIn(200);
  });

  //
  $("#addressqr").popover({
    html: true
  });



  $.ajax({
    method: 'GET',
    url: 'https://blockchain.info/ticker?cors=true',
    error: function(xhr) {
      console.log(xhr);
    },
    success: function(data) {
      console.log(data);
      $('#bountyAmount').on('keyup', function() {
        $(this).siblings('#currency-conversion').text("$" + (data['USD']['15m'] * $(this).val() / 1000).toFixed(2) + "USD");
      });
    }
  });


});
