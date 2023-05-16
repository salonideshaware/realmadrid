export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });


  // Tour-FAQ Fragment
  if (block.classList.contains("tour-faq")) {
    // Create a new div to wrap the tab titles
    const tabsWrapper = document.createElement('div');
    tabsWrapper.classList.add('swiper-container', 'tour-faq-tabs');
    block.prepend(tabsWrapper);

    /*  const swiperapper = document.createElement('div');
     swiperapper.classList.add('swiper-wrapper');
     tabsWrapper.appendChild(swiperapper); */

    // Create a new div to wrap the tab contents
    const contentWrapper = document.createElement('div');
    contentWrapper.classList.add('tour-faq-content-wrapper');

    // Move the tab titles into the new wrapper div and add tab functionality
    const tourFaqTabs = [...block.querySelectorAll('.columns > div')];

    tourFaqTabs.forEach((tab, index) => {
      const tabTitle = tab.firstElementChild;
      if (tabTitle) {
        const newTab = document.createElement('div');
        newTab.innerHTML = tabTitle.innerHTML;
        newTab.classList.add('swiper-slide');
        tabsWrapper.appendChild(newTab);
        tabTitle.remove();

        newTab.addEventListener('click', (event) => {
          event.stopPropagation();
          // Remove active class from all tab titles
          tabsWrapper.querySelectorAll('div').forEach(tabTitle => tabTitle.classList.remove('active'));
          // Add active class to the clicked tab title
          newTab.classList.add('active');

          // Remove active class from all content panels
          contentWrapper.querySelectorAll('div').forEach(div => div.classList.remove('active'));
          // Add active class to the corresponding content panel
          tab.classList.add('active');
        });

        if (index === 1) {
          newTab.classList.add('active');
          tab.classList.add('active');
        }
      }
      // Remove the content panel from the block element before appending it to the content wrapper
      block.removeChild(tab);
    });

    // Move the content panels into the new content wrapper div
    tourFaqTabs.forEach((tab, index) => {
      if (index === 0) {
        block.appendChild(tab);
      } else {
        contentWrapper.appendChild(tab);
      }
    });

    // Finally, append the content wrapper to the block element
    block.appendChild(contentWrapper);

    // Add the "question" class and click event listeners to toggle answer visibility
    const contentDivs = contentWrapper.querySelectorAll("div");
    contentDivs.forEach((contentDiv, contentDivIndex) => {
      const questionParas = contentDiv.querySelectorAll("p > strong");
      questionParas.forEach((question, questionIndex) => {
        const para = question.parentElement;
        para.classList.add("question");
        question.classList.add("question");
        const answer = question.parentElement.nextElementSibling;
        answer.classList.add("answer");
        if (window.innerWidth <= 768) {
          question.addEventListener("click", (event) => {
            event.stopImmediatePropagation();
            if (event.target !== question) return;

            // Close any other open answers
            contentDiv.querySelectorAll(".question.open").forEach((otherQuestion) => {
              if (otherQuestion !== question) {
                otherQuestion.classList.remove("open");
                otherQuestion.classList.add("close");
                otherQuestion.parentElement.nextElementSibling.classList.remove("open");
                otherQuestion.parentElement.nextElementSibling.classList.add("close");
              }
            });

            const isOpen = question.classList.contains("open");
            if (isOpen) {
              question.classList.remove("open");
              question.classList.add("close");
              answer.classList.remove("open");
              answer.classList.add("close");
            } else {
              question.classList.remove("close");
              question.classList.add("open");
              answer.classList.remove("close");
              answer.classList.add("open");
            }
          });
          // Display the first question's answer by default
          if (questionIndex === 0) {
            question.classList.add("open");
            answer.classList.add("open");
          } else {
            question.classList.add("close");
            answer.classList.add("close");
          }
        }
      });
    });
  }
}

