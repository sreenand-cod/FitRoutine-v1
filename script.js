/*==================================================
  FitRoutine - script.js (Part 1)
  Sections:
  1. App Configuration
  2. DOM Cache
  3. Utilities
  4. localStorage Manager
  5. Theme Manager
  6. Responsive Navigation
  7. Smooth Scrolling
==================================================*/

"use strict";

/*=========================================
  App Configuration
=========================================*/

const App = {
    storage: {
        theme: "fitroutine_theme",
        favourites: "fitroutine_favourites",
        workouts: "fitroutine_workouts",
        bmi: "fitroutine_bmi"
    }
};

/*=========================================
  DOM Cache
=========================================*/

const DOM = {

    body: document.body,

    navbar: document.querySelector(".navbar"),

    menuToggle: document.querySelector(".menu-toggle"),

    navLinks: document.querySelector(".nav-links"),

    themeToggle: document.querySelector(".theme-toggle"),

    navAnchors: document.querySelectorAll('.nav-links a'),

    sections: document.querySelectorAll("section")

};

/*=========================================
  Utility Functions
=========================================*/

const Utils = {

    qs(selector){

        return document.querySelector(selector);

    },

    qsa(selector){

        return [...document.querySelectorAll(selector)];

    },

    exists(element){

        return element !== null && element !== undefined;

    },

    clamp(value,min,max){

        return Math.min(Math.max(value,min),max);

    },

    safeJSON(value){

        try{

            return JSON.parse(value);

        }

        catch{

            return null;

        }

    }

};

/*=========================================
  Storage Manager
=========================================*/

const Storage = {

    get(key, fallback = null){

        try{

            const value = localStorage.getItem(key);

            if(value === null){

                return fallback;

            }

            return JSON.parse(value);

        }

        catch(error){

            console.error("Storage Read Error:", error);

            return fallback;

        }

    },

    set(key,value){

        try{

            localStorage.setItem(

                key,

                JSON.stringify(value)

            );

        }

        catch(error){

            console.error("Storage Write Error:", error);

        }

    },

    remove(key){

        try{

            localStorage.removeItem(key);

        }

        catch(error){

            console.error(error);

        }

    }

};

/*=========================================
  Theme Manager
=========================================*/

const Theme = {

    current:"dark",

    load(){

        const saved = Storage.get(App.storage.theme,"dark");

        this.current = saved;

        document.body.classList.toggle(

            "light",

            saved === "light"

        );

        this.updateIcon();

    },

    toggle(){

        this.current =

        this.current === "dark"

        ? "light"

        : "dark";

        document.body.classList.toggle(

            "light",

            this.current === "light"

        );

        Storage.set(

            App.storage.theme,

            this.current

        );

        this.updateIcon();

    },

    updateIcon(){

        if(!DOM.themeToggle) return;

        DOM.themeToggle.textContent =

        this.current === "dark"

        ? "🌙"

        : "☀️";

    },

    init(){

        this.load();

        DOM.themeToggle?.addEventListener(

            "click",

            ()=>this.toggle()

        );

    }

};

/*=========================================
  Navigation
=========================================*/

const Navigation = {

    open:false,

    toggle(){

        if(!DOM.navLinks) return;

        this.open = !this.open;

        DOM.navLinks.classList.toggle(

            "open",

            this.open

        );

        DOM.menuToggle?.setAttribute(

            "aria-expanded",

            this.open

        );

    },

    close(){

        this.open = false;

        DOM.navLinks?.classList.remove("open");

        DOM.menuToggle?.setAttribute(

            "aria-expanded",

            "false"

        );

    },

    bind(){

        DOM.menuToggle?.addEventListener(

            "click",

            ()=>this.toggle()

        );

        DOM.navAnchors.forEach(link=>{

            link.addEventListener(

                "click",

                ()=>this.close()

            );

        });

        window.addEventListener(

            "resize",

            ()=>{

                if(window.innerWidth>=768){

                    this.close();

                }

            }

        );

    }

};

/*=========================================
  Smooth Scrolling
=========================================*/

const Scroll = {

    init(){

        document

        .querySelectorAll('a[href^="#"]')

        .forEach(anchor=>{

            anchor.addEventListener(

                "click",

                event=>{

                    const target =

                    document.querySelector(

                        anchor.getAttribute("href")

                    );

                    if(!target) return;

                    event.preventDefault();

                    target.scrollIntoView({

                        behavior:"smooth",

                        block:"start"

                    });

                }

            );

        });

    }

};

/*=========================================
  Initialize
=========================================*/

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        Theme.init();

        Navigation.bind();

        Scroll.init();

    }

);/*==================================================
  FitRoutine - script.js (Part 2A)
  Sections:
  8. BMI Calculator
  9. Exercise Search
==================================================*/

/*=========================================
  BMI Calculator
=========================================*/

const BMI = {

    form: document.querySelector("#bmi form"),

    heightInput: document.querySelector("#height"),

    weightInput: document.querySelector("#weight"),

    resultBox: document.querySelector(".bmi-result"),

    calculate(height, weight){

        return weight / Math.pow(height / 100, 2);

    },

    category(value){

        if(value < 18.5){

            return {
                text: "Underweight",
                className: "bmi-underweight"
            };

        }

        if(value < 25){

            return {
                text: "Normal",
                className: "bmi-normal"
            };

        }

        if(value < 30){

            return {
                text: "Overweight",
                className: "bmi-overweight"
            };

        }

        return {
            text: "Obese",
            className: "bmi-obese"
        };

    },

    render(value){

        if(!this.resultBox) return;

        const bmi = Number(value.toFixed(1));

        const info = this.category(bmi);

        this.resultBox.innerHTML = `
            <div class="bmi-value">${bmi}</div>
            <div class="bmi-category ${info.className}">
                ${info.text}
            </div>
            <p>Your BMI has been calculated successfully.</p>
        `;

        Storage.set(App.storage.bmi,{
            bmi,
            category: info.text,
            date: Date.now()
        });

    },

    submit(event){

        event.preventDefault();

        const height = parseFloat(BMI.heightInput.value);

        const weight = parseFloat(BMI.weightInput.value);

        if(
            Number.isNaN(height) ||
            Number.isNaN(weight) ||
            height <= 0 ||
            weight <= 0
        ){

            alert("Please enter valid height and weight.");

            return;

        }

        BMI.render(

            BMI.calculate(height, weight)

        );

    },

    loadPrevious(){

        const data = Storage.get(App.storage.bmi);

        if(!data || !this.resultBox) return;

        this.resultBox.innerHTML = `
            <div class="bmi-value">${data.bmi}</div>
            <div class="bmi-category">
                ${data.category}
            </div>
            <p>Last saved result.</p>
        `;

    },

    init(){

        if(!this.form) return;

        this.loadPrevious();

        this.form.addEventListener(

            "submit",

            this.submit

        );

    }

};

/*=========================================
  Exercise Search
=========================================*/

const ExerciseSearch = {

    input: document.querySelector("#exercise-search"),

    cards: [...document.querySelectorAll(".exercise-card")],

    filter(query){

        const keyword = query.trim().toLowerCase();

        this.cards.forEach(card=>{

            const text =

                card.textContent.toLowerCase();

            const visible =

                text.includes(keyword);

            card.style.display =

                visible ? "" : "none";

        });

    },

    bind(){

        if(!this.input) return;

        this.input.addEventListener(

            "input",

            event=>{

                this.filter(

                    event.target.value

                );

            }

        );

    }

};

/*=========================================
  Extend App Initializer
=========================================*/

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        BMI.init();

        ExerciseSearch.bind();

    }

);/*==================================================
  FitRoutine - script.js (Part 2B)
  Sections:
  10. Difficulty Filter
  11. Workout Cards
  12. Animated Counters
==================================================*/

/*=========================================
  Difficulty Filter
=========================================*/

const DifficultyFilter = {

    select: document.querySelector("#difficulty-filter"),

    cards: [...document.querySelectorAll(".exercise-card")],

    filter(level){

        this.cards.forEach(card=>{

            const text = card.textContent.toLowerCase();

            if(level === "all"){

                card.style.display = "";

                return;

            }

            card.style.display =

                text.includes(level.toLowerCase())

                ? ""

                : "none";

        });

    },

    bind(){

        if(!this.select) return;

        this.select.addEventListener(

            "change",

            event=>{

                this.filter(event.target.value);

            }

        );

    }

};

/*=========================================
  Workout Cards
=========================================*/

const WorkoutCards = {

    cards: [...document.querySelectorAll(".workout-card")],

    bind(){

        if(!this.cards.length) return;

        this.cards.forEach((card,index)=>{

            card.setAttribute("tabindex","0");

            const activate = ()=>{

                card.classList.add("active");

                setTimeout(

                    ()=>card.classList.remove("active"),

                    220

                );

                const workouts =

                    Storage.get(

                        App.storage.workouts,

                        []

                    );

                workouts.push({

                    id:Date.now(),

                    workout:index + 1,

                    title:

                        card.querySelector("h3")?.textContent ||

                        `Workout ${index + 1}`,

                    completedAt:

                        new Date().toISOString()

                });

                Storage.set(

                    App.storage.workouts,

                    workouts

                );

            };

            card.addEventListener(

                "click",

                activate

            );

            card.addEventListener(

                "keydown",

                event=>{

                    if(

                        event.key === "Enter" ||

                        event.key === " "

                    ){

                        event.preventDefault();

                        activate();

                    }

                }

            );

        });

    }

};

/*=========================================
  Animated Counters
=========================================*/

const Counters = {

    items: [...document.querySelectorAll("[data-counter]")],

    duration: 1200,

    started:false,

    animate(element){

        const target = Number(

            element.dataset.counter || 0

        );

        let start = null;

        const step = timestamp=>{

            if(!start) start = timestamp;

            const progress = Math.min(

                (timestamp - start) /

                this.duration,

                1

            );

            element.textContent = Math.floor(

                progress * target

            ).toLocaleString();

            if(progress < 1){

                requestAnimationFrame(step);

            }else{

                element.textContent =

                    target.toLocaleString();

            }

        };

        requestAnimationFrame(step);

    },

    start(){

        if(this.started) return;

        this.started = true;

        this.items.forEach(

            item=>this.animate(item)

        );

    },

    observe(){

        if(!this.items.length) return;

        const observer = new IntersectionObserver(

            entries=>{

                entries.forEach(entry=>{

                    if(entry.isIntersecting){

                        this.start();

                        observer.disconnect();

                    }

                });

            },

            {

                threshold:0.35

            }

        );

        this.items.forEach(

            item=>observer.observe(item)

        );

    }

};

/*=========================================
  Extend Initializer
=========================================*/

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        DifficultyFilter.bind();

        WorkoutCards.bind();

        Counters.observe();

    }

);/*==================================================
  FitRoutine - script.js (Part 3A)
  Sections:
  13. Exercise Modal
  14. Favourite Exercises
==================================================*/

/*=========================================
  Exercise Modal
=========================================*/

const ExerciseModal = {

    modal: document.querySelector("#exercise-modal"),

    title: document.querySelector("#exercise-modal-title"),

    content: document.querySelector("#exercise-modal section"),

    closeButton: document.querySelector("#exercise-modal header button"),

    buttons: [...document.querySelectorAll(".exercise-card button")],

    currentCard: null,

    open(card){

        if(!this.modal || !card) return;

        this.currentCard = card;

        const title =
            card.querySelector("h3")?.textContent ||
            "Exercise";

        const details =
            card.querySelector("p")?.textContent ||
            "";

        if(this.title){

            this.title.textContent = title;

        }

        if(this.content){

            this.content.innerHTML = `
                <p>${details}</p>
                <p>
                    Practice proper form and controlled
                    movement for the best results.
                </p>
            `;

        }

        if(typeof this.modal.showModal === "function"){

            this.modal.showModal();

        }else{

            this.modal.setAttribute("open","");

        }

        this.closeButton?.focus();

    },

    close(){

        if(!this.modal) return;

        if(typeof this.modal.close === "function"){

            this.modal.close();

        }else{

            this.modal.removeAttribute("open");

        }

        this.currentCard?.querySelector("button")?.focus();

    },

    bind(){

        this.buttons.forEach(button=>{

            button.addEventListener(

                "click",

                ()=>{

                    this.open(

                        button.closest(".exercise-card")

                    );

                }

            );

        });

        this.closeButton?.addEventListener(

            "click",

            ()=>this.close()

        );

        this.modal?.addEventListener(

            "click",

            event=>{

                const rect =

                    this.modal.getBoundingClientRect();

                const inside =

                    event.clientX >= rect.left &&
                    event.clientX <= rect.right &&
                    event.clientY >= rect.top &&
                    event.clientY <= rect.bottom;

                if(!inside){

                    this.close();

                }

            }

        );

    }

};

/*=========================================
  Favourite Exercises
=========================================*/

const Favourites = {

    key: App.storage.favourites,

    list: Storage.get(

        App.storage.favourites,

        []

    ),

    buttons: [],

    save(){

        Storage.set(

            this.key,

            this.list

        );

    },

    exists(name){

        return this.list.includes(name);

    },

    toggle(name){

        if(this.exists(name)){

            this.list = this.list.filter(

                item=>item !== name

            );

        }else{

            this.list.push(name);

        }

        this.save();

        this.refreshButtons();

        this.render();

    },

    refreshButtons(){

        this.buttons.forEach(button=>{

            const card =

                button.closest(".exercise-card");

            if(!card) return;

            const title =

                card.querySelector("h3")?.textContent || "";

            const active =

                this.exists(title);

            button.classList.toggle(

                "active",

                active

            );

            button.setAttribute(

                "aria-pressed",

                active

            );

            button.innerHTML =

                active

                ? "★ Favourite"

                : "☆ Favourite";

        });

    },

    render(){

        const container =

            document.querySelector(".favorites-grid");

        if(!container) return;

        if(this.list.length === 0){

            container.innerHTML = `
                <article class="favorite-card">
                    <h3>No favourites yet</h3>
                    <p>
                        Save exercises to see them here.
                    </p>
                </article>
            `;

            return;

        }

        container.innerHTML =

            this.list.map(name=>`

                <article class="favorite-card">

                    <h3>${name}</h3>

                    <p>
                        Saved to your favourite exercises.
                    </p>

                </article>

            `).join("");

    },

    createButtons(){

        Utils.qsa(".exercise-card").forEach(card=>{

            const title =

                card.querySelector("h3")?.textContent || "";

            let button =

                card.querySelector(".favorite-btn");

            if(button) return;

            button = document.createElement("button");

            button.type = "button";

            button.className = "favorite-btn";

            card.appendChild(button);

            button.addEventListener(

                "click",

                ()=>this.toggle(title)

            );

            this.buttons.push(button);

        });

    },

    init(){

        this.createButtons();

        this.refreshButtons();

        this.render();

    }

};

/*=========================================
  Extend Initializer
=========================================*/

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        ExerciseModal.bind();

        Favourites.init();

    }

);/*==================================================
  FitRoutine - script.js (Part 3B-1)
  Sections:
  15. Toast Notifications
  16. Keyboard Accessibility
==================================================*/

/*=========================================
  Toast Notification Manager
=========================================*/

const Toast = {

    container: null,

    init(){

        this.container = document.createElement("div");
        this.container.className = "toast-container";
        this.container.setAttribute("aria-live","polite");
        this.container.setAttribute("aria-atomic","true");

        document.body.appendChild(this.container);

    },

    show(message,type="info",duration=3000){

        if(!this.container){

            this.init();

        }

        const toast = document.createElement("div");

        toast.className = `toast toast-${type}`;

        toast.setAttribute("role","status");

        toast.innerHTML = `
            <span class="toast-message">${message}</span>
            <button
                class="toast-close"
                aria-label="Close notification">
                ✕
            </button>
        `;

        this.container.appendChild(toast);

        requestAnimationFrame(()=>{

            toast.classList.add("show");

        });

        const remove = ()=>{

            toast.classList.remove("show");

            setTimeout(()=>{

                toast.remove();

            },300);

        };

        toast
            .querySelector(".toast-close")
            ?.addEventListener("click",remove);

        setTimeout(remove,duration);

    }

};

/*=========================================
  Keyboard Accessibility
=========================================*/

const Accessibility = {

    modal(){

        document.addEventListener(

            "keydown",

            event=>{

                if(

                    event.key === "Escape" &&

                    ExerciseModal.modal?.hasAttribute("open")

                ){

                    ExerciseModal.close();

                }

            }

        );

    },

    cards(){

        Utils.qsa(

            ".exercise-card, .workout-card"

        ).forEach(card=>{

            card.setAttribute("tabindex","0");

            card.setAttribute(

                "role",

                "button"

            );

            card.addEventListener(

                "keydown",

                event=>{

                    if(

                        event.key === "Enter" ||

                        event.key === " "

                    ){

                        event.preventDefault();

                        card.click();

                    }

                }

            );

        });

    },

    navigation(){

        document.addEventListener(

            "keydown",

            event=>{

                if(

                    event.key === "/" &&

                    document.activeElement.tagName !== "INPUT"

                ){

                    event.preventDefault();

                    Utils.qs("#exercise-search")?.focus();

                }

            }

        );

    },

    focusVisible(){

        document.addEventListener(

            "keyup",

            event=>{

                if(event.key === "Tab"){

                    document.body.classList.add(

                        "using-keyboard"

                    );

                }

            }

        );

        document.addEventListener(

            "mousedown",

            ()=>{

                document.body.classList.remove(

                    "using-keyboard"

                );

            }

        );

    },

    init(){

        this.modal();

        this.cards();

        this.navigation();

        this.focusVisible();

    }

};

/*=========================================
  Extend Initializer
=========================================*/

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        Toast.init();

        Accessibility.init();

    }

);/*==================================================
  FitRoutine - script.js (Part 3B-2)
  Sections:
  17. Pixel Animation Helpers
  18. Error Handling
  19. Final Application Bootstrap
==================================================*/

/*=========================================
  Pixel Animation Helpers
=========================================*/

const PixelFX = {

    animated: [],

    collect(){

        this.animated = [

            ...Utils.qsa(".feature-card"),
            ...Utils.qsa(".exercise-card"),
            ...Utils.qsa(".workout-card"),
            ...Utils.qsa(".favorite-card"),
            ...Utils.qsa(".pixel-card")

        ];

    },

    hover(){

        this.animated.forEach(card=>{

            card.addEventListener("mouseenter",()=>{

                card.classList.add("pixel-pulse");

            });

            card.addEventListener("mouseleave",()=>{

                card.classList.remove("pixel-pulse");

            });

        });

    },

    reveal(){

        const items = Utils.qsa(".reveal");

        if(!items.length) return;

        const observer = new IntersectionObserver(entries=>{

            entries.forEach(entry=>{

                if(entry.isIntersecting){

                    entry.target.classList.add("active");

                    observer.unobserve(entry.target);

                }

            });

        },{
            threshold:0.2
        });

        items.forEach(item=>observer.observe(item));

    },

    init(){

        this.collect();

        this.hover();

        this.reveal();

    }

};

/*=========================================
  Global Error Handling
=========================================*/

const ErrorHandler = {

    log(error,context="Application"){

        console.error(`[${context}]`,error);

        if(typeof Toast !== "undefined"){

            Toast.show(

                "Something went wrong.",

                "error",

                3500

            );

        }

    },

    install(){

        window.addEventListener(

            "error",

            event=>{

                this.log(

                    event.error || event.message,

                    "Runtime"

                );

            }

        );

        window.addEventListener(

            "unhandledrejection",

            event=>{

                this.log(

                    event.reason,

                    "Promise"

                );

            }

        );

    }

};

/*=========================================
  Final Application Bootstrap
=========================================*/

const Bootstrap = {

    start(){

        try{

            PixelFX.init();

            ErrorHandler.install();

            console.log(

                "%cFitRoutine Ready",

                "color:#59d0ff;font-weight:bold;"

            );

            if(typeof Toast !== "undefined"){

                Toast.show(

                    "Welcome to FitRoutine!",

                    "success",

                    2500

                );

            }

        }

        catch(error){

            ErrorHandler.log(

                error,

                "Bootstrap"

            );

        }

    }

};

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        Bootstrap.start();

    }

);
