//Class to load json files
class Json {
    constructor(value) {
        this.value = value;
    }

    loadJson() {
        let http = new XMLHttpRequest();

        http.addEventListener('load', this.JsonLoaded);
        http.addEventListener('error', this.JsonError.bind(this));
        http.open('GET', `${this.value}`);
        http.send();
    }

    JsonError() {
        this.createErrorNode();
    }

    JsonLoaded() {
        let json_Form = JSON.parse(this.responseText);
        let controls = new Controls(json_Form.controls);

        document.getElementById("button_sub").textContent = "Usuń formularz";
        controls.setControls();
    }

    createErrorNode() {
        let errorInfo = document.createElement('p');

        errorInfo.textContent = 'Something went wrong, try again!';
        errorInfo.classList.add('form-error','text-danger');
        document.querySelector('#form_url').appendChild(errorInfo);

        setTimeout(() => {
            errorInfo.remove();
        },3000);
    }

};

//Class to load controls
class Controls {

    constructor(JsonFormData) {
        this.Jsondata = JsonFormData;
        this.form_loaded = document.getElementById('form_loaded');
    }

    loadText(control) {
        let textinput = document.createElement('input');
        let textlabel = document.createElement('label');
        let control_group = document.createElement('div');

        textinput.classList.add('form-control');
        control_group.classList.add('control_group');
        textinput.value = control.defaultValue;
        textinput.type = control.type;
        textinput.name = control.key;
        textlabel.textContent = control.caption;
        textlabel.htmlFor = textinput.name;

        control_group.appendChild(textlabel);
        control_group.appendChild(textinput);
        this.form_loaded.appendChild(control_group);
    }

    loadList(control) {
        let select = document.createElement('select');
        let selectlabel = document.createElement('label');
        let control_group = document.createElement('div');

        control_group.classList.add('control_group');
        select.classList.add('form-control');
        select.name = control.key;

        control.items.forEach(item => {
            let option = document.createElement('option');

            if (item.value === control.defaultValue) {
                option.value = item.value;
                option.textContent = item.caption;
                option.selected = 'selected';
                select.appendChild(option);
            } else {
                option.value = item.value;
                option.textContent = item.caption;
                select.appendChild(option);
            }
        });

        selectlabel.textContent = control.caption;
        selectlabel.htmlFor = select.name;

        control_group.appendChild(selectlabel);
        control_group.appendChild(select);
        this.form_loaded.appendChild(control_group);
    }

    loadCheckbox(control) {
        let checkbox = document.createElement('input');
        let checklabel = document.createElement('label');
        let control_group = document.createElement('div');

        checkbox.classList.add('form-control');
        control_group.classList.add('control_check');
        checkbox.value = control.defaultValue;
        checkbox.type = control.type;
        checkbox.name = control.key;

        if (checkbox.value === 'true') {
            checkbox.checked = 'checked';
        }

        checklabel.textContent = control.caption;
        checklabel.htmlFor = checkbox.name;

        control_group.appendChild(checklabel);
        control_group.appendChild(checkbox);
        this.form_loaded.appendChild(control_group);

    }

    loadButton() {
        let button = document.createElement('button');

        button.type = 'submit';
        button.name = 'btn_accept';
        button.textContent = 'Zatwierdź';
        button.classList.add('btn', 'btn-primary')
        button.addEventListener('click', onSubmit);

        this.form_loaded.appendChild(button);
    }

    setControls() {

        for (let control of this.Jsondata) {
            if (control.type === 'TEXT') {
                this.loadText(control);
            } else if (control.type === 'CHECKBOX') {
                this.loadCheckbox(control);
            } else if (control.type === 'LIST') {
                this.loadList(control);
            }
        }

        this.loadButton();
    }
}
//class to get data like filename/jsonarray/date as string
class SmallData {
    constructor(formValues, Url) {
        this.form_Values = formValues;
        this.url = Url;
        this.form_loaded = document.getElementById('form_loaded');

        this.getFileName();
        this.GetJsonArray();
        this.DateString();
    }
    getFileName() {
        let url = this.url;

        url = url.substring(this.url.lastIndexOf('/') + 1);
        url = url.substring(0, this.url.lastIndexOf('.'));
        this.url = url;
    }

    GetJsonArray() {
        let json = [];

        for (let i = 0; i < this.form_Values.length - 1; i++) {
            let obj = {};
            let item = this.form_Values.item(i);

            if (this.form_Values.item(i).type === 'checkbox') {
                if (this.form_Values.item(i).checked) {
                    obj['name'] = item.name;
                    obj['value'] = item.value;
                    json.push(obj);
                }
            } else {
                obj['name'] = item.name;
                obj['value'] = item.value;
                json.push(obj);
            }
        }

        this.jsonArray = json;
    }

    DateString() {
        let date = new Date();
        let date_split = {
            year: date.getFullYear(),
            month: ('0' + (date.getMonth() + 1)).slice(-2),
            day: ('0' + (date.getDate())).slice(-2),
            hour: ('0' + (date.getHours())).slice(-2),
            minutes: ('0' + (date.getMinutes())).slice(-2),
        }
        let string_date = '';

        date_split = Object.values(date_split);

        for (let elem of date_split) {
            string_date += `${elem}`;
        }

        this.stringDate = string_date;
    }

    CreateJsonView() {
        let json_text = document.createElement('div');
        let json_p = document.createElement('p');
        let data = JSON.stringify(this.jsonArray);

        json_text.classList.add('row', 'json_div');
        json_p.classList.add('json_text');
        json_p.setAttribute('style', 'white-space: pre;');

        json_p.textContent = `${data[0]} \r\n`;

        this.jsonArray.forEach((obj, index) => {
            if (index === this.jsonArray.length - 1) {
                json_p.textContent += `	${JSON.stringify(obj)} \r\n`;
            } else {
                json_p.textContent += `	${JSON.stringify(obj)}, \r\n`;
            }
        });
        json_p.textContent += `${data[data.length - 1]} \r\n`;

        json_text.appendChild(json_p);
        this.form_loaded.after(json_text);
    }

    Createdownloadlink(data) {
        let blob = new Blob([data], {
            type: 'octet/stream'
        });
        let url = window.URL.createObjectURL(blob);
        let a_download = document.createElement('a');
        
        a_download.href = url;
        a_download.target = '_blank'
        a_download.download = `${this.url}_${this.stringDate}.out.json`;

        document.body.appendChild(a_download);
        a_download.click();
        document.body.removeChild(a_download);
    }
}

//Function which gets data from form ,after submiting.
function onSubmit(e) {
    e.preventDefault();

    if (json_div = document.querySelector('.json_div')) {
        json_div.remove();
    }
    let urlName = document.querySelector("#url");
    let form_Values = document.getElementById('form_loaded').elements;
    let Data = new SmallData(form_Values, urlName.value);
    let data = JSON.stringify(Data.jsonArray);

    Data.Createdownloadlink(data);
    Data.CreateJsonView();
};



//Function which handles the button click event
function ButtonHandler() {
    let clicked = false;
    let form_loaded;
    const button = document.getElementById("button_sub");

    button.addEventListener("click", e => {
        e.preventDefault();
        //checking if button was clicked before

        if (clicked) {
            form_loaded.remove();
            clicked = false;
            document.getElementById("button_sub").textContent = "Pobierz formularz";

            if ((json_div = document.querySelector(".json_div"))) {
                json_div.remove();
            }
            //If it wasn't clicked we are loading form.
        } else {
            let valuefield = document.querySelector("#url");

            if (valuefield.checkValidity()) {
                form_loaded = document.createElement("form");
                form_loaded.id = "form_loaded";
                document.querySelector("main").after(form_loaded);
                clicked = true;
                let json = new Json(valuefield.value, form_loaded);
                json.loadJson();
            } else {
                alert("Proszę poprawnie uzupełnić pole");
            }
        }
    });
}