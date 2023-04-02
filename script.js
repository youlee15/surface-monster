const container = document.querySelector('.container');
const template = document.getElementById('monster');

const data = await fetch('./data.json').then(res => res.json());
const Definitions = new class {
    data;

    constructor(data) {
        this.data = data;
    }

    getTypeName(id) {
        return this.data.types.find(t => t.id === id).name;
    }
}(data);

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const el = entry.target;
            const id = el.dataset.id;
            Cursor.current = id;
        }
    });
}, {
    root: container,
    threshold: 0.5
});

for (const monster of Definitions.data.monsters) {
    createMonsterElements(monster);
}

function createMonsterElements(definition) {
    const id = String(definition.id);

    const clone = template.content.cloneNode(true);
    const monster = clone.querySelector('.monster-container');
    monster.dataset.id = id;
    observer.observe(monster);

    const name = clone.querySelector('.monster-name');
    name.textContent = `${id.padStart(3, '0')}: ${definition.name}`;
    const type = clone.querySelector('.monster-type');
    const typeName = Definitions.getTypeName(definition.type);
    type.textContent = typeName;

    const image = clone.querySelector('.monster-image > img');
    image.src = `img/${definition.id}.png`;

    const exp = clone.querySelector('.monster-exp');
    exp.textContent = definition.exp;

    const status = definition.status ?? {};
    const statusToText = lv => Array(lv ?? 0).fill('★').join('');
    
    const hardness = clone.querySelector('.status-hardness');
    hardness.textContent = statusToText(status.hardness);
    const elasticity = clone.querySelector('.status-elasticity');
    elasticity.textContent = statusToText(status.elasticity);
    const agility = clone.querySelector('.status-agility');
    agility.textContent = statusToText(status.agility);
    const cleverness = clone.querySelector('.status-cleverness');
    cleverness.textContent = statusToText(status.cleverness);
    const stamina = clone.querySelector('.status-stamina');
    stamina.textContent = statusToText(status.stamina);

    const skills = clone.querySelector('.monster-skill');
    for (const skill of definition?.skills ?? [{ name: 'なし' }]) {
        const row = createSkillRow(skill);
        skills.appendChild(row);
    }

    container.appendChild(clone);
}

function createSkillRow(skill) {
    const row = document.createElement('tr');
    const name = document.createElement('td');
    name.textContent = skill.name;
    row.appendChild(name);
    const power = document.createElement('td');
    power.textContent = skill.power;
    row.appendChild(power);
    return row;
}

const Cursor = new class {
    next = document.getElementById('next');
    prev = document.getElementById('prev');
    current;
    first;
    last;

    constructor(data) {
        this.next.onclick = () => this.#toNext();
        this.prev.onclick = () => this.#toPrev();
        const ids = data.monsters.map(m => m.id);
        this.first = Math.min(...ids);
        this.last = Math.max(...ids);
        this.current = this.first;
    }

    #toNext() {
        if (this.current === this.last) {
            return;
        }
        this.current++;
        this.scroll();
    }

    #toPrev() {
        if (this.current === this.first) {
            return;
        }
        this.current--;
        this.scroll();
    }

    scroll(id) {
        document.querySelector(`.monster-container[data-id="${id ?? this.current}"]`).scrollIntoView();
    }
}(data);
