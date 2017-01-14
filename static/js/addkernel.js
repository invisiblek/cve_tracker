$(document).ready(function() {
  $('#addkernel').on('click', function() {
    window.location = "/addkernel/" + $('#kerneltoadd').val()
  });
});
