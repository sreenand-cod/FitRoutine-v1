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

const exercises = [
  {
    id: 1,
    name: "Push-Up",
    difficulty: "Beginner",
    category: "Chest",
    calories: 50,
    description: "A classic bodyweight exercise that strengthens the upper body.",
    benefits: [
      "Builds chest strength",
      "Improves arm endurance",
      "Strengthens core"
    ],
    targetMuscles: ["Chest", "Shoulders", "Triceps", "Core"],
    instructions: [
      "Start in a plank position.",
      "Lower your chest until your elbows reach 90°.",
      "Push back to the starting position."
    ],
    duration: "3 sets",
    repetitions: "12 reps",
    equipment: "None",
    pixelAnimation: "pushup",
    favorite: false
  },
  {
    id: 2,
    name: "Squat",
    difficulty: "Beginner",
    category: "Legs",
    calories: 60,
    description: "Fundamental lower-body movement for strength and mobility.",
    benefits: [
      "Strengthens legs",
      "Improves balance",
      "Boosts mobility"
    ],
    targetMuscles: ["Quadriceps", "Hamstrings", "Glutes"],
    instructions: [
      "Stand shoulder-width apart.",
      "Lower hips until thighs are nearly parallel.",
      "Drive through your heels to stand."
    ],
    duration: "3 sets",
    repetitions: "15 reps",
    equipment: "None",
    pixelAnimation: "squat",
    favorite: false
  },
  {
    id: 3,
    name: "Plank",
    difficulty: "Beginner",
    category: "Core",
    calories: 40,
    description: "Static hold that develops core stability.",
    benefits: [
      "Improves posture",
      "Strengthens core",
      "Increases endurance"
    ],
    targetMuscles: ["Core", "Shoulders", "Lower Back"],
    instructions: [
      "Keep elbows under shoulders.",
      "Maintain a straight body line.",
      "Hold while breathing steadily."
    ],
    duration: "45 sec",
    repetitions: "3 rounds",
    equipment: "None",
    pixelAnimation: "plank",
    favorite: false
  },
  {
    id: 4,
    name: "Jumping Jacks",
    difficulty: "Beginner",
    category: "Cardio",
    calories: 70,
    description: "A full-body cardio warm-up exercise.",
    benefits: [
      "Raises heart rate",
      "Improves coordination",
      "Burns calories"
    ],
    targetMuscles: ["Legs", "Shoulders", "Core"],
    instructions: [
      "Jump feet apart.",
      "Raise arms overhead.",
      "Return to the starting position."
    ],
    duration: "2 min",
    repetitions: "60 reps",
    equipment: "None",
    pixelAnimation: "jump",
    favorite: false
  },
  {
    id: 5,
    name: "Lunges",
    difficulty: "Beginner",
    category: "Legs",
    calories: 65,
    description: "Excellent exercise for lower-body strength and balance.",
    benefits: [
      "Builds leg strength",
      "Improves stability",
      "Enhances flexibility"
    ],
    targetMuscles: ["Glutes", "Quadriceps", "Hamstrings"],
    instructions: [
      "Step forward.",
      "Lower both knees.",
      "Push back to standing."
    ],
    duration: "3 sets",
    repetitions: "12 each leg",
    equipment: "None",
    pixelAnimation: "lunge",
    favorite: false
  },
  {
    id: 6,
    name: "Mountain Climbers",
    difficulty: "Intermediate",
    category: "Cardio",
    calories: 85,
    description: "Fast-paced bodyweight cardio movement.",
    benefits: [
      "Burns fat",
      "Strengthens core",
      "Improves endurance"
    ],
    targetMuscles: ["Core", "Shoulders", "Legs"],
    instructions: [
      "Start in a plank.",
      "Drive knees toward chest alternately.",
      "Maintain a steady pace."
    ],
    duration: "40 sec",
    repetitions: "3 rounds",
    equipment: "None",
    pixelAnimation: "climber",
    favorite: false
  },
  {
    id: 7,
    name: "Burpees",
    difficulty: "Advanced",
    category: "Full Body",
    calories: 120,
    description: "High-intensity exercise targeting the whole body.",
    benefits: [
      "Improves conditioning",
      "Builds power",
      "Burns many calories"
    ],
    targetMuscles: ["Chest", "Legs", "Core", "Shoulders"],
    instructions: [
      "Squat down.",
      "Kick feet back.",
      "Perform a push-up.",
      "Jump upward."
    ],
    duration: "30 sec",
    repetitions: "15 reps",
    equipment: "None",
    pixelAnimation: "burpee",
    favorite: false
  },
  {
    id: 8,
    name: "Pull-Up",
    difficulty: "Advanced",
    category: "Back",
    calories: 75,
    description: "Bodyweight pulling exercise for upper-body strength.",
    benefits: [
      "Builds back",
      "Strengthens grip",
      "Develops arms"
    ],
    targetMuscles: ["Lats", "Biceps", "Forearms"],
    instructions: [
      "Grip the bar.",
      "Pull until chin clears the bar.",
      "Lower slowly."
    ],
    duration: "3 sets",
    repetitions: "8 reps",
    equipment: "Pull-Up Bar",
    pixelAnimation: "pullup",
    favorite: false
  },
  {
    id: 9,
    name: "Bicycle Crunch",
    difficulty: "Intermediate",
    category: "Core",
    calories: 55,
    description: "Dynamic abdominal exercise for rotational strength.",
    benefits: [
      "Targets abs",
      "Improves coordination",
      "Strengthens obliques"
    ],
    targetMuscles: ["Abs", "Obliques"],
    instructions: [
      "Lie on your back.",
      "Bring opposite elbow to knee.",
      "Alternate sides continuously."
    ],
    duration: "45 sec",
    repetitions: "20 reps",
    equipment: "None",
    pixelAnimation: "bicycle",
    favorite: false
  },
  {
    id: 10,
    name: "Bench Dip",
    difficulty: "Intermediate",
    category: "Arms",
    calories: 60,
    description: "Bodyweight exercise that targets the triceps.",
    benefits: [
      "Strengthens triceps",
      "Improves pushing power",
      "Enhances arm endurance"
    ],
    targetMuscles: ["Triceps", "Shoulders", "Chest"],
    instructions: [
      "Place hands on a bench.",
      "Lower your body.",
      "Push back up."
    ],
    duration: "3 sets",
    repetitions: "12 reps",
    equipment: "Bench",
    pixelAnimation: "dip",
    favorite: false
  }
];{
    id: 11,
    name: "Deadlift",
    difficulty: "Advanced",
    category: "Back",
    calories: 110,
    description: "A compound strength exercise that develops the posterior chain.",
    benefits: [
      "Builds total-body strength",
      "Improves posture",
      "Strengthens grip"
    ],
    targetMuscles: ["Lower Back", "Glutes", "Hamstrings", "Trapezius"],
    instructions: [
      "Stand with feet hip-width apart.",
      "Grip the bar with a straight back.",
      "Lift by extending hips and knees.",
      "Lower the weight under control."
    ],
    duration: "4 sets",
    repetitions: "8 reps",
    equipment: "Barbell",
    pixelAnimation: "deadlift",
    favorite: false
  },
  {
    id: 12,
    name: "Dumbbell Shoulder Press",
    difficulty: "Intermediate",
    category: "Shoulders",
    calories: 70,
    description: "An overhead pressing movement that builds shoulder strength.",
    benefits: [
      "Develops shoulders",
      "Improves upper-body strength",
      "Enhances stability"
    ],
    targetMuscles: ["Deltoids", "Triceps", "Upper Chest"],
    instructions: [
      "Hold dumbbells at shoulder level.",
      "Press upward until arms are extended.",
      "Lower slowly to the starting position."
    ],
    duration: "3 sets",
    repetitions: "12 reps",
    equipment: "Dumbbells",
    pixelAnimation: "shoulderPress",
    favorite: false
  },
  {
    id: 13,
    name: "Russian Twist",
    difficulty: "Intermediate",
    category: "Core",
    calories: 55,
    description: "A rotational exercise for strengthening the core and obliques.",
    benefits: [
      "Strengthens obliques",
      "Improves rotational power",
      "Enhances balance"
    ],
    targetMuscles: ["Obliques", "Abs", "Lower Back"],
    instructions: [
      "Sit with knees bent.",
      "Lean back slightly.",
      "Rotate your torso from side to side."
    ],
    duration: "45 sec",
    repetitions: "20 reps",
    equipment: "Medicine Ball (Optional)",
    pixelAnimation: "twist",
    favorite: false
  },
  {
    id: 14,
    name: "High Knees",
    difficulty: "Beginner",
    category: "Cardio",
    calories: 80,
    description: "A cardio drill that improves endurance and coordination.",
    benefits: [
      "Raises heart rate",
      "Improves agility",
      "Burns calories"
    ],
    targetMuscles: ["Legs", "Core", "Hip Flexors"],
    instructions: [
      "Stand tall.",
      "Run in place while lifting knees high.",
      "Maintain a quick rhythm."
    ],
    duration: "1 minute",
    repetitions: "3 rounds",
    equipment: "None",
    pixelAnimation: "highKnees",
    favorite: false
  },
  {
    id: 15,
    name: "Glute Bridge",
    difficulty: "Beginner",
    category: "Glutes",
    calories: 45,
    description: "A simple exercise for strengthening the glutes and hips.",
    benefits: [
      "Activates glutes",
      "Supports lower back",
      "Improves hip mobility"
    ],
    targetMuscles: ["Glutes", "Hamstrings", "Core"],
    instructions: [
      "Lie on your back with knees bent.",
      "Lift your hips toward the ceiling.",
      "Pause briefly and lower slowly."
    ],
    duration: "3 sets",
    repetitions: "15 reps",
    equipment: "None",
    pixelAnimation: "bridge",
    favorite: false
  },{
    id: 16,
    name: "Incline Push-Up",
    difficulty: "Beginner",
    category: "Chest",
    calories: 45,
    description: "An easier variation of the push-up using an elevated surface.",
    benefits: [
      "Builds upper-body strength",
      "Reduces wrist strain",
      "Improves push-up technique"
    ],
    targetMuscles: ["Chest", "Shoulders", "Triceps"],
    instructions: [
      "Place your hands on an elevated surface.",
      "Lower your chest toward the surface.",
      "Push back to the starting position."
    ],
    duration: "3 sets",
    repetitions: "15 reps",
    equipment: "Bench",
    pixelAnimation: "inclinePushup",
    favorite: false
  },
  {
    id: 17,
    name: "Jump Squat",
    difficulty: "Intermediate",
    category: "Legs",
    calories: 90,
    description: "An explosive squat variation that develops lower-body power.",
    benefits: [
      "Improves explosive strength",
      "Burns calories",
      "Increases athletic performance"
    ],
    targetMuscles: ["Quadriceps", "Glutes", "Calves"],
    instructions: [
      "Perform a regular squat.",
      "Explode upward into a jump.",
      "Land softly and repeat."
    ],
    duration: "40 sec",
    repetitions: "15 reps",
    equipment: "None",
    pixelAnimation: "jumpSquat",
    favorite: false
  },
  {
    id: 18,
    name: "Dumbbell Row",
    difficulty: "Intermediate",
    category: "Back",
    calories: 70,
    description: "A pulling exercise that strengthens the back and arms.",
    benefits: [
      "Builds back muscles",
      "Improves posture",
      "Increases pulling strength"
    ],
    targetMuscles: ["Lats", "Rhomboids", "Biceps"],
    instructions: [
      "Support one hand on a bench.",
      "Pull the dumbbell toward your waist.",
      "Lower under control."
    ],
    duration: "3 sets",
    repetitions: "12 reps each arm",
    equipment: "Dumbbell",
    pixelAnimation: "row",
    favorite: false
  },
  {
    id: 19,
    name: "Side Plank",
    difficulty: "Intermediate",
    category: "Core",
    calories: 45,
    description: "A static exercise that targets the obliques and core stabilizers.",
    benefits: [
      "Strengthens obliques",
      "Improves balance",
      "Enhances core stability"
    ],
    targetMuscles: ["Obliques", "Core", "Shoulders"],
    instructions: [
      "Lie on one side.",
      "Lift your hips off the floor.",
      "Maintain a straight body position."
    ],
    duration: "30 sec each side",
    repetitions: "3 rounds",
    equipment: "None",
    pixelAnimation: "sidePlank",
    favorite: false
  },
  {
    id: 20,
    name: "Standing Calf Raise",
    difficulty: "Beginner",
    category: "Legs",
    calories: 35,
    description: "An isolation exercise for strengthening the calf muscles.",
    benefits: [
      "Builds calf strength",
      "Improves ankle stability",
      "Enhances jumping ability"
    ],
    targetMuscles: ["Calves"],
    instructions: [
      "Stand with feet hip-width apart.",
      "Raise your heels off the floor.",
      "Pause briefly and lower slowly."
    ],
    duration: "3 sets",
    repetitions: "20 reps",
    equipment: "None",
    pixelAnimation: "calfRaise",
    favorite: false
  },{
    id: 21,
    name: "Diamond Push-Up",
    difficulty: "Advanced",
    category: "Chest",
    calories: 75,
    description: "A challenging push-up variation that emphasizes the triceps and inner chest.",
    benefits: [
      "Builds triceps strength",
      "Targets inner chest",
      "Improves upper-body endurance"
    ],
    targetMuscles: ["Triceps", "Chest", "Shoulders"],
    instructions: [
      "Place hands together forming a diamond shape.",
      "Keep your body straight.",
      "Lower your chest toward your hands.",
      "Push back to the starting position."
    ],
    duration: "3 sets",
    repetitions: "10 reps",
    equipment: "None",
    pixelAnimation: "diamondPushup",
    favorite: false
  },
  {
    id: 22,
    name: "Bear Crawl",
    difficulty: "Intermediate",
    category: "Full Body",
    calories: 95,
    description: "A crawling movement that develops coordination, stability, and strength.",
    benefits: [
      "Strengthens the entire body",
      "Improves coordination",
      "Enhances mobility"
    ],
    targetMuscles: ["Core", "Shoulders", "Legs", "Arms"],
    instructions: [
      "Start on hands and feet.",
      "Lift knees slightly off the floor.",
      "Move opposite hand and foot forward.",
      "Continue while keeping your back flat."
    ],
    duration: "45 sec",
    repetitions: "3 rounds",
    equipment: "None",
    pixelAnimation: "bearCrawl",
    favorite: false
  },
  {
    id: 23,
    name: "Superman",
    difficulty: "Beginner",
    category: "Back",
    calories: 35,
    description: "A bodyweight exercise that strengthens the lower back and improves posture.",
    benefits: [
      "Strengthens lower back",
      "Improves posture",
      "Enhances spinal stability"
    ],
    targetMuscles: ["Lower Back", "Glutes", "Shoulders"],
    instructions: [
      "Lie face down.",
      "Raise both arms and legs simultaneously.",
      "Hold briefly.",
      "Lower with control."
    ],
    duration: "30 sec",
    repetitions: "15 reps",
    equipment: "None",
    pixelAnimation: "superman",
    favorite: false
  },
  {
    id: 24,
    name: "Triceps Dip",
    difficulty: "Intermediate",
    category: "Arms",
    calories: 65,
    description: "An effective bodyweight exercise for building triceps strength.",
    benefits: [
      "Develops triceps",
      "Strengthens shoulders",
      "Improves pushing power"
    ],
    targetMuscles: ["Triceps", "Chest", "Shoulders"],
    instructions: [
      "Place hands on a sturdy bench.",
      "Lower your body until elbows reach about 90 degrees.",
      "Push back to the starting position."
    ],
    duration: "3 sets",
    repetitions: "12 reps",
    equipment: "Bench",
    pixelAnimation: "tricepsDip",
    favorite: false
  },
  {
    id: 25,
    name: "Reverse Crunch",
    difficulty: "Beginner",
    category: "Core",
    calories: 45,
    description: "A controlled abdominal exercise focusing on the lower abs.",
    benefits: [
      "Targets lower abs",
      "Improves core control",
      "Reduces strain on the neck"
    ],
    targetMuscles: ["Lower Abs", "Core", "Hip Flexors"],
    instructions: [
      "Lie on your back with knees bent.",
      "Lift knees toward your chest.",
      "Curl hips off the floor.",
      "Lower slowly."
    ],
    duration: "3 sets",
    repetitions: "15 reps",
    equipment: "None",
    pixelAnimation: "reverseCrunch",
    favorite: false
  },{
    id: 26,
    name: "Wall Sit",
    difficulty: "Beginner",
    category: "Legs",
    calories: 40,
    description: "An isometric exercise that builds lower-body endurance.",
    benefits: [
      "Improves leg endurance",
      "Strengthens quadriceps",
      "Enhances stability"
    ],
    targetMuscles: ["Quadriceps", "Glutes", "Calves"],
    instructions: [
      "Stand against a wall.",
      "Slide down until knees are at 90 degrees.",
      "Hold the position.",
      "Stand up slowly."
    ],
    duration: "45 sec",
    repetitions: "3 rounds",
    equipment: "Wall",
    pixelAnimation: "wallSit",
    favorite: false
  },
  {
    id: 27,
    name: "Hammer Curl",
    difficulty: "Beginner",
    category: "Arms",
    calories: 45,
    description: "A dumbbell exercise that develops the biceps and forearms.",
    benefits: [
      "Builds arm strength",
      "Improves grip",
      "Strengthens forearms"
    ],
    targetMuscles: ["Biceps", "Brachialis", "Forearms"],
    instructions: [
      "Hold dumbbells with a neutral grip.",
      "Curl the weights toward your shoulders.",
      "Pause briefly.",
      "Lower under control."
    ],
    duration: "3 sets",
    repetitions: "12 reps",
    equipment: "Dumbbells",
    pixelAnimation: "hammerCurl",
    favorite: false
  },
  {
    id: 28,
    name: "Bicycle Kick",
    difficulty: "Intermediate",
    category: "Core",
    calories: 60,
    description: "A dynamic abdominal exercise targeting the core and obliques.",
    benefits: [
      "Strengthens abs",
      "Targets obliques",
      "Improves endurance"
    ],
    targetMuscles: ["Abs", "Obliques", "Hip Flexors"],
    instructions: [
      "Lie on your back.",
      "Lift shoulders slightly.",
      "Pedal your legs while twisting your torso.",
      "Maintain a steady rhythm."
    ],
    duration: "40 sec",
    repetitions: "20 reps",
    equipment: "None",
    pixelAnimation: "bicycleKick",
    favorite: false
  },
  {
    id: 29,
    name: "Step-Up",
    difficulty: "Beginner",
    category: "Legs",
    calories: 55,
    description: "A functional lower-body exercise using a stable platform.",
    benefits: [
      "Improves balance",
      "Strengthens legs",
      "Enhances coordination"
    ],
    targetMuscles: ["Quadriceps", "Glutes", "Hamstrings"],
    instructions: [
      "Place one foot on a bench.",
      "Push through your heel.",
      "Step up completely.",
      "Return with control."
    ],
    duration: "3 sets",
    repetitions: "12 reps each leg",
    equipment: "Bench",
    pixelAnimation: "stepUp",
    favorite: false
  },
  {
    id: 30,
    name: "Arnold Press",
    difficulty: "Intermediate",
    category: "Shoulders",
    calories: 75,
    description: "A shoulder exercise that combines rotation with overhead pressing.",
    benefits: [
      "Builds shoulder strength",
      "Improves shoulder mobility",
      "Targets all deltoid heads"
    ],
    targetMuscles: ["Deltoids", "Triceps", "Upper Chest"],
    instructions: [
      "Hold dumbbells in front of your shoulders.",
      "Rotate your palms outward while pressing upward.",
      "Fully extend your arms.",
      "Reverse the movement slowly."
    ],
    duration: "3 sets",
    repetitions: "10 reps",
    equipment: "Dumbbells",
    pixelAnimation: "arnoldPress",
    favorite: false
  },{
    id: 31,
    name: "Goblet Squat",
    difficulty: "Intermediate",
    category: "Legs",
    calories: 80,
    description: "A squat variation performed while holding a dumbbell or kettlebell close to the chest.",
    benefits: [
      "Builds lower-body strength",
      "Improves squat technique",
      "Enhances core stability"
    ],
    targetMuscles: ["Quadriceps", "Glutes", "Hamstrings", "Core"],
    instructions: [
      "Hold a dumbbell at chest level.",
      "Stand with feet shoulder-width apart.",
      "Lower into a squat.",
      "Drive through your heels to stand."
    ],
    duration: "3 sets",
    repetitions: "12 reps",
    equipment: "Dumbbell",
    pixelAnimation: "gobletSquat",
    favorite: false
  },
  {
    id: 32,
    name: "Lat Pulldown",
    difficulty: "Intermediate",
    category: "Back",
    calories: 70,
    description: "A machine exercise that develops upper-back strength.",
    benefits: [
      "Strengthens lats",
      "Improves posture",
      "Builds pulling power"
    ],
    targetMuscles: ["Latissimus Dorsi", "Biceps", "Rhomboids"],
    instructions: [
      "Sit at the machine.",
      "Grip the bar wider than shoulder-width.",
      "Pull the bar to your upper chest.",
      "Return slowly."
    ],
    duration: "3 sets",
    repetitions: "12 reps",
    equipment: "Lat Pulldown Machine",
    pixelAnimation: "latPulldown",
    favorite: false
  },
  {
    id: 33,
    name: "Pike Push-Up",
    difficulty: "Intermediate",
    category: "Shoulders",
    calories: 65,
    description: "A bodyweight exercise that targets the shoulders using a pike position.",
    benefits: [
      "Builds shoulder strength",
      "Improves balance",
      "Prepares for handstands"
    ],
    targetMuscles: ["Shoulders", "Triceps", "Upper Chest"],
    instructions: [
      "Start in a pike position.",
      "Lower your head toward the floor.",
      "Push back to the starting position."
    ],
    duration: "3 sets",
    repetitions: "10 reps",
    equipment: "None",
    pixelAnimation: "pikePushup",
    favorite: false
  },
  {
    id: 34,
    name: "Leg Raise",
    difficulty: "Beginner",
    category: "Core",
    calories: 50,
    description: "A lower abdominal exercise performed while lying on your back.",
    benefits: [
      "Strengthens lower abs",
      "Improves core control",
      "Supports hip stability"
    ],
    targetMuscles: ["Lower Abs", "Hip Flexors", "Core"],
    instructions: [
      "Lie flat on your back.",
      "Keep your legs straight.",
      "Raise your legs until vertical.",
      "Lower slowly without touching the floor."
    ],
    duration: "3 sets",
    repetitions: "15 reps",
    equipment: "None",
    pixelAnimation: "legRaise",
    favorite: false
  },
  {
    id: 35,
    name: "Box Jump",
    difficulty: "Advanced",
    category: "Plyometrics",
    calories: 95,
    description: "An explosive exercise that develops lower-body power and athleticism.",
    benefits: [
      "Improves jumping ability",
      "Builds explosive strength",
      "Enhances coordination"
    ],
    targetMuscles: ["Quadriceps", "Glutes", "Calves"],
    instructions: [
      "Stand in front of a sturdy box.",
      "Jump onto the box with both feet.",
      "Stand upright.",
      "Step down safely."
    ],
    duration: "3 sets",
    repetitions: "10 reps",
    equipment: "Plyometric Box",
    pixelAnimation: "boxJump",
    favorite: false
  },{
    id: 36,
    name: "Seated Cable Row",
    difficulty: "Intermediate",
    category: "Back",
    calories: 75,
    description: "A machine exercise that strengthens the middle back and improves posture.",
    benefits: [
      "Develops back thickness",
      "Improves posture",
      "Strengthens pulling muscles"
    ],
    targetMuscles: ["Rhomboids", "Latissimus Dorsi", "Biceps"],
    instructions: [
      "Sit with feet on the platform.",
      "Grip the handle firmly.",
      "Pull the handle toward your torso.",
      "Return slowly to the starting position."
    ],
    duration: "3 sets",
    repetitions: "12 reps",
    equipment: "Cable Machine",
    pixelAnimation: "cableRow",
    favorite: false
  },
  {
    id: 37,
    name: "Bulgarian Split Squat",
    difficulty: "Advanced",
    category: "Legs",
    calories: 90,
    description: "A single-leg exercise that improves strength, balance, and stability.",
    benefits: [
      "Builds leg strength",
      "Improves balance",
      "Corrects muscle imbalances"
    ],
    targetMuscles: ["Quadriceps", "Glutes", "Hamstrings"],
    instructions: [
      "Place one foot on a bench behind you.",
      "Lower your body until the front thigh is parallel.",
      "Push through the front heel.",
      "Repeat before switching legs."
    ],
    duration: "3 sets",
    repetitions: "10 reps each leg",
    equipment: "Bench",
    pixelAnimation: "bulgarianSplitSquat",
    favorite: false
  },
  {
    id: 38,
    name: "Front Plank Reach",
    difficulty: "Intermediate",
    category: "Core",
    calories: 55,
    description: "A plank variation that challenges stability while reaching forward.",
    benefits: [
      "Strengthens core",
      "Improves shoulder stability",
      "Enhances coordination"
    ],
    targetMuscles: ["Core", "Shoulders", "Lower Back"],
    instructions: [
      "Hold a high plank position.",
      "Reach one arm forward.",
      "Return it to the floor.",
      "Alternate sides while keeping hips stable."
    ],
    duration: "40 sec",
    repetitions: "16 reaches",
    equipment: "None",
    pixelAnimation: "plankReach",
    favorite: false
  },
  {
    id: 39,
    name: "Kettlebell Swing",
    difficulty: "Intermediate",
    category: "Full Body",
    calories: 110,
    description: "A dynamic exercise that builds power and cardiovascular endurance.",
    benefits: [
      "Improves hip power",
      "Burns calories",
      "Strengthens the posterior chain"
    ],
    targetMuscles: ["Glutes", "Hamstrings", "Core", "Lower Back"],
    instructions: [
      "Hold the kettlebell with both hands.",
      "Swing it between your legs.",
      "Drive hips forward to lift it to chest height.",
      "Repeat with controlled rhythm."
    ],
    duration: "45 sec",
    repetitions: "20 reps",
    equipment: "Kettlebell",
    pixelAnimation: "kettlebellSwing",
    favorite: false
  },
  {
    id: 40,
    name: "Face Pull",
    difficulty: "Beginner",
    category: "Shoulders",
    calories: 50,
    description: "A cable exercise that strengthens the rear shoulders and upper back.",
    benefits: [
      "Improves posture",
      "Strengthens rear deltoids",
      "Enhances shoulder health"
    ],
    targetMuscles: ["Rear Deltoids", "Trapezius", "Rhomboids"],
    instructions: [
      "Attach a rope to a cable machine.",
      "Pull the rope toward your face.",
      "Keep elbows high.",
      "Return slowly under control."
    ],
    duration: "3 sets",
    repetitions: "15 reps",
    equipment: "Cable Machine",
    pixelAnimation: "facePull",
    favorite: false
  },{
    id: 41,
    name: "Single-Leg Deadlift",
    difficulty: "Intermediate",
    category: "Balance",
    calories: 65,
    description: "A unilateral exercise that improves balance, coordination, and posterior chain strength.",
    benefits: [
      "Improves balance",
      "Strengthens hamstrings",
      "Enhances hip stability"
    ],
    targetMuscles: ["Hamstrings", "Glutes", "Core"],
    instructions: [
      "Stand on one leg.",
      "Hinge at the hips while extending the opposite leg.",
      "Lower until your torso is nearly parallel to the floor.",
      "Return to the starting position."
    ],
    duration: "3 sets",
    repetitions: "10 reps each leg",
    equipment: "Dumbbell (Optional)",
    pixelAnimation: "singleLegDeadlift",
    favorite: false
  },
  {
    id: 42,
    name: "Jump Rope",
    difficulty: "Beginner",
    category: "Cardio",
    calories: 130,
    description: "A classic cardio exercise that improves endurance, rhythm, and coordination.",
    benefits: [
      "Burns calories",
      "Improves cardiovascular fitness",
      "Enhances footwork"
    ],
    targetMuscles: ["Calves", "Shoulders", "Core"],
    instructions: [
      "Hold the rope handles firmly.",
      "Rotate the rope using your wrists.",
      "Jump lightly over the rope.",
      "Maintain a steady rhythm."
    ],
    duration: "5 minutes",
    repetitions: "Continuous",
    equipment: "Jump Rope",
    pixelAnimation: "jumpRope",
    favorite: false
  },
  {
    id: 43,
    name: "Reverse Lunge",
    difficulty: "Beginner",
    category: "Legs",
    calories: 60,
    description: "A lower-body exercise that strengthens the legs while reducing knee stress.",
    benefits: [
      "Improves balance",
      "Strengthens glutes",
      "Enhances lower-body stability"
    ],
    targetMuscles: ["Quadriceps", "Glutes", "Hamstrings"],
    instructions: [
      "Stand upright.",
      "Step one foot backward.",
      "Lower both knees to about 90 degrees.",
      "Push back to the starting position."
    ],
    duration: "3 sets",
    repetitions: "12 reps each leg",
    equipment: "None",
    pixelAnimation: "reverseLunge",
    favorite: false
  },
  {
    id: 44,
    name: "Chest Fly",
    difficulty: "Intermediate",
    category: "Chest",
    calories: 65,
    description: "An isolation movement that develops the chest muscles through a wide arc.",
    benefits: [
      "Improves chest definition",
      "Enhances flexibility",
      "Strengthens the pectorals"
    ],
    targetMuscles: ["Chest", "Front Deltoids"],
    instructions: [
      "Lie on a bench holding dumbbells.",
      "Extend your arms above your chest.",
      "Lower the weights in a wide arc.",
      "Bring them back together under control."
    ],
    duration: "3 sets",
    repetitions: "12 reps",
    equipment: "Dumbbells",
    pixelAnimation: "chestFly",
    favorite: false
  },
  {
    id: 45,
    name: "Bird Dog",
    difficulty: "Beginner",
    category: "Core",
    calories: 35,
    description: "A stability exercise that improves coordination and spinal support.",
    benefits: [
      "Strengthens core",
      "Improves posture",
      "Enhances balance"
    ],
    targetMuscles: ["Core", "Lower Back", "Glutes", "Shoulders"],
    instructions: [
      "Begin on your hands and knees.",
      "Extend one arm and the opposite leg.",
      "Hold briefly while keeping your back straight.",
      "Return and switch sides."
    ],
    duration: "3 sets",
    repetitions: "12 reps each side",
    equipment: "None",
    pixelAnimation: "birdDog",
    favorite: false
  },{
    id: 46,
    name: "Farmer's Carry",
    difficulty: "Intermediate",
    category: "Full Body",
    calories: 90,
    description: "A functional carrying exercise that develops grip, core stability, and overall strength.",
    benefits: [
      "Improves grip strength",
      "Enhances core stability",
      "Builds functional strength"
    ],
    targetMuscles: ["Forearms", "Core", "Shoulders", "Trapezius"],
    instructions: [
      "Hold a heavy weight in each hand.",
      "Stand tall with shoulders back.",
      "Walk forward using controlled steps.",
      "Maintain good posture throughout."
    ],
    duration: "45 sec",
    repetitions: "3 rounds",
    equipment: "Dumbbells",
    pixelAnimation: "farmersCarry",
    favorite: false
  },
  {
    id: 47,
    name: "Hip Thrust",
    difficulty: "Intermediate",
    category: "Glutes",
    calories: 75,
    description: "A powerful exercise that targets the glutes and improves hip strength.",
    benefits: [
      "Builds glute strength",
      "Improves hip extension",
      "Supports athletic performance"
    ],
    targetMuscles: ["Glutes", "Hamstrings", "Core"],
    instructions: [
      "Rest your upper back on a bench.",
      "Place feet flat on the floor.",
      "Drive hips upward until fully extended.",
      "Lower slowly under control."
    ],
    duration: "3 sets",
    repetitions: "12 reps",
    equipment: "Bench and Barbell",
    pixelAnimation: "hipThrust",
    favorite: false
  },
  {
    id: 48,
    name: "Renegade Row",
    difficulty: "Advanced",
    category: "Full Body",
    calories: 95,
    description: "A challenging plank variation combined with alternating dumbbell rows.",
    benefits: [
      "Strengthens the core",
      "Builds upper-body strength",
      "Improves balance"
    ],
    targetMuscles: ["Core", "Lats", "Biceps", "Shoulders"],
    instructions: [
      "Begin in a plank holding dumbbells.",
      "Row one dumbbell toward your waist.",
      "Lower it with control.",
      "Alternate sides while keeping hips stable."
    ],
    duration: "3 sets",
    repetitions: "10 reps each side",
    equipment: "Dumbbells",
    pixelAnimation: "renegadeRow",
    favorite: false
  },
  {
    id: 49,
    name: "Donkey Kick",
    difficulty: "Beginner",
    category: "Glutes",
    calories: 40,
    description: "An isolation exercise that activates the glutes and improves hip mobility.",
    benefits: [
      "Activates glutes",
      "Strengthens hips",
      "Improves stability"
    ],
    targetMuscles: ["Glutes", "Hamstrings", "Core"],
    instructions: [
      "Start on your hands and knees.",
      "Lift one leg upward with the knee bent.",
      "Squeeze the glutes at the top.",
      "Lower and repeat before switching legs."
    ],
    duration: "3 sets",
    repetitions: "15 reps each leg",
    equipment: "None",
    pixelAnimation: "donkeyKick",
    favorite: false
  },
  {
    id: 50,
    name: "Medicine Ball Slam",
    difficulty: "Advanced",
    category: "Full Body",
    calories: 120,
    description: "An explosive exercise that combines strength, power, and cardiovascular conditioning.",
    benefits: [
      "Develops explosive power",
      "Burns calories",
      "Strengthens the entire body"
    ],
    targetMuscles: ["Core", "Shoulders", "Arms", "Legs"],
    instructions: [
      "Lift the medicine ball overhead.",
      "Engage your core.",
      "Forcefully slam the ball onto the floor.",
      "Catch or retrieve the ball and repeat."
    ],
    duration: "45 sec",
    repetitions: "15 reps",
    equipment: "Medicine Ball",
    pixelAnimation: "ballSlam",
    favorite: false
  }
];
