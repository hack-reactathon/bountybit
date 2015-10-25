$(document).ready(function() {

  // Place JavaScript code here...
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


});
