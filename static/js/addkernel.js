$(document).ready(function() {
  $('#addkernel').on('click', function() {
    var kernel = $('#kerneltoadd').val();
    if (kernel) {
      window.location = "/addkernel/" + kernel
    }
  });
});
