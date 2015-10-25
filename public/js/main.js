$(document).ready(function() {

  //toggle main boxes in / root
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

  //popover init
  $("#addressqr").popover({
    html: true
  });

  $(".tableqr").popover({
    html: true
  });


  //get up to date conversion numbers
  if($('#bountyAmount').length > 0) {
    $.ajax({
      method: 'GET',
      url: 'https://blockchain.info/ticker?cors=true',
      error: function(xhr) {
        console.log(xhr);
      },
      success: function(data) {
        $('#bountyAmount').on('keyup', function() {
          $(this).siblings('#currency-conversion').text("$" + (data['USD']['15m'] * $(this).val() / 1000).toFixed(2) + "USD");
        });
      }
    });
  }


  //get total for users wallet
  var userWalletAddress = $('#wallet-address').text();
  if (userWalletAddress) {
    $.ajax({
      method: 'GET',
      url: 'https://blockchain.info/q/addressbalance/' + userWalletAddress + '/confirmations=3?cors=true',
      error: function(xhr) {
        console.log(xhr);
      },
      success: function(data) {
        var bc = (data / 100000000).toFixed(2);
        $('#wallet-total').text(bc);
      }
    });
  }

  var $tableAddresses = $('.tableqr');
  if ($tableAddresses.length > 0) {

    $tableAddresses.each(function(index) {
      var $address = $(this);
      $.ajax({
        method: 'GET',
        url: 'https://blockchain.info/q/getreceivedbyaddress/' + $address.text() + '/confirmations=3?cors=true',
        error: function(xhr) {
          console.log(xhr);
        },
        success: function(data) {
          var bc = (data / 100000000).toFixed(2);
          $address.closest('tr').find('.total').text(bc);
        }
      });
    });
  }

  $('.release-bounty').on('click', 'a', function() {
    var $link = $(this);
    $.ajax({
      method: 'POST',
      url: '/bounty/complete',
      data: {
        bountyID: $(this).closest('tr').find('.hidden').text(),
        bountyUrl: $(this).closest('tr').find('.bounty-url'),
        _csrf: $(this).attr('_csrf')
      },
      error: function(xhr) {
        console.log(xhr);
      },
      success: function(data) {
        console.log(data);
        var $solvedCell = $link.closest('tr').find('.bounty-solved');
        $solvedCell.text('true');
        $solvedCell.removeClass('danger');
        $solvedCell.addClass('success');
      }
    });
  });


});
