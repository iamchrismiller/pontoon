$(function () {
  // Run the tour only on project with slug 'demo'
  if (Pontoon.state.project !== "demo") {
    return;
  }

  var isEntityClicked = false;
  var isSubmitClicked = false;

  var tourStatus = Number($('#server').data('tour-status') || 0);

  var submitTarget = "#editor #single button#save";
  var submitText = "A user needs to be logged in to be able to submit " +
  "translations. Non-authenticated users will see a link to Sign in " +
  "instead of the translation toolbar with a button to save their translation.";

  // Translators
  if (Pontoon.user.canTranslate()) {
    submitText = "If a translator has permissions to add translations directly, " +
    "the green SAVE button should appear to the lower-right side of " +
    "the editing space.To add translations directly, simply input " +
    "the translation to the editing space and click SAVE";
  }
  // Contributors
  else if (Pontoon.user.id) {
    submitText = "When a translator is in Suggest Mode, or doesn’t have permissions " +
    "to submit translations directly, a blue SUGGEST button will " +
    "be visible in the lower-right side of the editing space. To " +
    "suggest a translation, simply input the translation to the " +
    "editing space and click SUGGEST";
  }
  // Non-authenticated users
  else {
    submitTarget = null;
  }

  var updateTourStatus = function (step) {
    if (Pontoon.user.id) {
      $.ajax({
        url: "/update-tour-status/",
        type: "POST",
        data: {
          csrfmiddlewaretoken: $("#server").data("csrf"),
          tour_status: step
        },
        success: function(data) {
          return data;
        }
      });
    }
  };

  Sideshow.registerWizard({
    name: "introducing_pontoon",
    title: "Introducing Pontoon",
    description: "Introducing the main features of translate page of Pontoon. ",
    affects: [
      function() {
        return true;
      }
    ]
  }).storyLine({
    showStepPosition: true,
    steps: [
      {
        title: "Hey there!",
        text:
          "Pontoon is a web-based, What-You-See-Is-What-You-Get (WYSIWYG) " +
          "localization (l10n) tool. At Mozilla, we currently use Pontoon " +
          "to localize various Mozilla project.",
        listeners: {
          beforeStep: function() {
            // Take the user directly to next step of where he left.
            if (tourStatus !== 0)
              Sideshow.gotoStep(tourStatus+1);
          },
          afterStep: function() {
            if (tourStatus === 0) {
              updateTourStatus(++tourStatus);
            }
          }
        },
      },
      {
        title: "Main toolbar",
        text:
          "The main toolbar allows you to navigate amongst projects without " +
          "leaving the translation workspace",
        subject: "div.container.clearfix",
        format: "markdown",
        lockSubject: true,
        listeners: {
          afterStep: function() {
            updateTourStatus(++tourStatus);
          }
        },
      },
      {
        title: "Project information",
        text:
          "An overview of the status of the selected resource is located to " +
          "the right of the main toolbar. Translators can view information " +
          "regarding the project, its priority level, and testing by clicking the icon.",
        subject: "#progress .menu",
        targets: "#progress .menu",
        format: "markdown",
        listeners: {
          beforeStep: function() {
            $("#progress .menu").css("display", "block");
            $("#progress .menu").addClass("permanent");
          },
          afterStep: function() {
            $("#progress .menu").removeClass("permanent");
            $("#progress .menu").css("display", "none");
            updateTourStatus(++tourStatus);
          }
        }
      },
      {
        title: "Search Bar",
        text:
          "It’s possible to search within a project using the search field." +
          " Searches include strings, string IDs and comments. Like in " +
          "search engines, by default Pontoon will display matches that " +
          "contain all the search terms.<ul><li> If you want to search for a " +
          "perfect match, wrap the search terms in double quotes, e.g. \"new tab\"." +
          "</li><li> If, on the other hand, you want to search for strings that " +
          "contain double quotes, you can escape them with a backslash " +
          "e.g. `<a href=\\\"foo\\\">`.</li></ul>",
        subject: "#entitylist #search",
        targets: "#entitylist #search",
        format: "markdown",
        lockSubject: true,
        listeners: {
          afterStep: function() {
            updateTourStatus(++tourStatus);
          }
        },
      },
      {
        title: "Filter",
        text:
          "Strings in Pontoon can be filtered by their status. A string can be<ul>" +
          "<li> Missing: Not available in the localized file and doesn’t have any approved translations in Pontoon.</li>" +
          "<li> Fuzzy: Marked as fuzzy in the localized file.</li>" +
          "<li> Translated: Has an approved translation.</li>" +
          "<li> Unreviewed: Has been submitted but not reviewed yet by translators.</li>" +
          "<li> Rejected: Has been reviewed and rejected by a translator.</li></ul>",
        subject: "#filter .menu",
        targets: "#filter .menu",
        format: "markdown",
        lockSubject: true,
        listeners: {
          beforeStep: function() {
            $("#filter div.button").click();
            $("#filter .menu").addClass("permanent");
          },
          afterStep: function() {
            $("#filter .menu").removeClass("permanent");
            $("#filter .menu").css("display", "none");
            updateTourStatus(++tourStatus);
          }
        }
      },
      {
        title: "String List",
        text:
          "The sidebar displays the list of strings in the current project " +
          "resource. The status of each string (Missing, Translated, etc.) " +
          "is indicated by a differently colored square.",
        subject: "#entitylist",
        format: "markdown",
        lockSubject: true,
        listeners: {
          afterStep: function() {
            updateTourStatus(++tourStatus);
          }
        },
      },
      {
        title: "A String",
        text: "Clicking on a string opens up the editor.",
        subject: "#entitylist .uneditables li:nth-child(3)",
        format: "markdown",
        autoContinue: true,
        targets: "#entitylist .uneditables li:nth-child(3)",
        showNextButton: true,
        completingConditions: [
          function() {
            $("#entitylist .uneditables li:nth-child(3)").click(function() {
              isEntityClicked = true;
            });
            return isEntityClicked;
          }
        ],
        listeners: {
          afterStep: function() {
            updateTourStatus(++tourStatus);
          }
        },
      },
      {
        title: "Editor",
        text: "The translation workspace is where strings are translated." +
        "When working on FTL (Fluent) files or string with plurals, the " +
        "editing space will look a bit different",
        subject: "#editor #single",
        format: "markdown",
        lockSubject: true,
        listeners: {
          afterStep: function() {
            updateTourStatus(++tourStatus);
          }
        },
      },
      {
        title: "Submit a Translation",
        text: submitText,
        subject: "#editor #single",
        format: "markdown",
        autoContinue: true,
        showNextButton: true,
        targets: submitTarget,
        completingConditions: [
          function() {
            $("#editor #single button#save").click(function() {
              isSubmitClicked = true;
            });
            return isSubmitClicked;
          }
        ],
        listeners: {
          afterStep: function() {
            updateTourStatus(++tourStatus);
          }
        },
      },
      {
        title: "History Tab",
        text:
          "The history tab shows all of the suggestions and translations that " +
          "have been submitted for the current source string. To the right of " +
          "the entry, icons indicate the state of each element i.e. " +
          "Approved (Green check mark), Rejected (Red cross), " +
          "Unreviewed (Grey check mark & cross)",
        subject: "#helpers",
        format: "markdown",
        targets: "#helpers.tabs nav li:nth-child(1)",
        listeners: {
          beforeStep: function() {
            $("#entitylist .uneditables li:nth-child(3)").click();
          },
          afterStep: function() {
            updateTourStatus(++tourStatus);
          }
        },
      },
      {
        title: "Machinery Tab",
        text:
          "There is a machinery search bar. A translator can look for existing " +
          "matches for any strings in the machinery resources that may be " +
          "similar. The search does not need to be related to the current " +
          "project string.",
        subject: "#helpers",
        format: "markdown",
        targets: "#helpers.tabs nav li:nth-child(2)",
        listeners: {
          beforeStep: function() {
            $("#helpers.tabs nav li")[1].firstElementChild.click();
          },
          afterStep: function() {
            updateTourStatus(++tourStatus);
          }
        },
      },
      {
        title: "Locales Tab",
        text:
          "The locales tab shows approved translations from Pontoon projects in " +
          "other locales. It is useful for seeing what general style choices " +
          "are made by other localization communities. When encountering a " +
          "difficult string, a translator can reference the methods that have "+
          "been used by other languages in making a stylistic decision.",
        subject: "#helpers",
        format: "markdown",
        targets: "#helpers.tabs nav li:nth-child(3)",
        listeners: {
          beforeStep: function() {
            $("#helpers.tabs nav li")[2].firstElementChild.click();
          },
          afterStep: function() {
            updateTourStatus(++tourStatus);
          }
        },
      },
      {
        title: "That's (NOT) all, folks!",
        text:
          "There's a wide variety of tools to help you with translations, " +
          "some of which we didn't mention in this introductory tutorial. " +
          "<br>For more topics of interest for localizers at Mozilla " +
          "please have a look at the [Localizer Documentation]" +
          "(https://mozilla-l10n.github.io/localizer-documentation/). " +
          "<br> Feel free to explore this demo project to know about these  " +
          "or move forward to translate some live projects.",
        format: "markdown",
        listeners: {
          afterStep: function() {
            updateTourStatus(-1);
          }
        },
      }
    ]
  });

  // Run the tour only if not completed by user
  if (tourStatus !== -1) {
    Sideshow.start({ listAll: true });

    // If a user closes the tour at step 3 or step 5
    // run the corresponding afterStep function.
    $('.sideshow-close-button').click(function() {
      setTimeout(function() {
        $("#filter .menu").fadeOut(function() {
          $("#filter .menu").removeClass("permanent");
        });

        $("#progress .menu").fadeOut(function() {
          $("#progress .menu").removeClass("permanent");
        });
      },600);
    });
  }
});
