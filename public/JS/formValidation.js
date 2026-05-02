// =======================
// IMMEDIATELY INVOKED FUNCTION (IIFE)
// =======================

(() => {
  "use strict";
  // 👉 Enables strict mode (prevents common JS mistakes, safer code)

  
  // Select all forms that need validation
  // Usually forms have class="needs-validation" (Bootstrap validation)
  const forms = document.querySelectorAll(".needs-validation");


  // Convert NodeList → Array and loop through each form
  Array.from(forms).forEach((form) => {

    // Add event listener for form submission
    form.addEventListener(
      "submit",
      (event) => {

        // checkValidity() → built-in HTML5 validation
        // returns false if any required field is invalid
        if (!form.checkValidity()) {

          // Prevent form submission if invalid
          event.preventDefault();

          // Stop event from bubbling up (extra safety)
          event.stopPropagation();
        }

        // Add Bootstrap class to show validation styles
        // (green/red borders, error messages, etc.)
        form.classList.add("was-validated");
      },

      false // use bubbling phase (default)
    );
  });
})();