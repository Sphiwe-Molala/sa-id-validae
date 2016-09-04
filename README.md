# sa-id-validae
Easy to use South African ID validator. It validates from any HTML element capable of containing text and returns an object with easy to use information

#Still in development
...html
<script>
  var validationObjects = new SaIdValidae( ".className" , "[ 40 - 42 ] : [ 45 ]" );
  var results = validationObjects.validate();
</script>
...
