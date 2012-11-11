(function ($) {

    //demo data
    /*
    var contacts = [
        
        { name: "Contact 1", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "family" },
        { name: "Contact 2", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "family" },
        { name: "Contact 3", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "friend" },
        { name: "Contact 4", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "colleague" },
        { name: "Contact 5", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "family" },
        { name: "Contact 6", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "colleague" },
        { name: "Contact 7", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "friend" },
        { name: "Contact 8", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "family" }
        
    ];
    */
    

    Backbone.emulateHTTP = true;
    Backbone.emulateJSON = true;

    //define contact model
    var Contact = Backbone.Model.extend({
        defaults: {
            photo: "img/placeholder.png",
            name: "",
            address: "",
            tel: "",
            email: "",
            type: ""
        },
        url: function() {
            return "/api/contacts/manage/" + this.get('id');
        }
    });

    //define directory collection
    var Directory = Backbone.Collection.extend({
        model: Contact
    });

    //define individual contact view
    var ContactView = Backbone.View.extend({
        tagName: "article",
        className: "contact-wrapper",
        template: Handlebars.compile($("#contactTemplate").html()),
        editTemplate: Handlebars.compile($("#contactEditTemplate").html()),

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        events: {
            "click a.delete": "deleteContact",
            "click a.edit": "editContact",
            "change select.type": "addType",
            "click button.save": "saveEdits",
            "click button.cancel": "cancelEdit"
        },

        //delete a contact
        deleteContact: function (e) {            
            e.preventDefault();
            var self = this,
                removedType = this.model.get("type").toLowerCase();

            //remove model
            this.model.destroy()
                .done(function(){
                    self.remove();
                })
                .fail(function(error){
                    alert(error.responseText);
                });            

            //re-render select if no more of deleted type
            if (_.indexOf(directory.getTypes(), removedType) === -1) {
                directory.$el.find("#filter select").children("[value='" + removedType + "']").remove();
            }
        },

        //switch contact to edit mode
        editContact: function (e) { 
            e.preventDefault();           
            this.$el.html(this.editTemplate(this.model.toJSON()));

            //add select to set type
            var newOpt = $("<option/>", {
                html: "<em>Add new...</em>",
                value: "addType"
            });

            var lblSelect = $("<label/>", { text: "Type" }).insertAfter(this.$el.find(".name"));

            this.select = directory.createSelect().addClass("type").val(this.$el.find("#type").val()).append(newOpt).insertAfter(lblSelect);
            this.$el.find("input[type='hidden']").remove();
        },

        addType: function () {
            if (this.select.val() === "addType") {

                this.select.remove();

                $("<input />", {
                    "class": "type"
                }).insertAfter(this.$el.find(".name")).focus();
            }
        },

        saveEdits: function (e) {
            e.preventDefault();

            var formData = {},
                prev = this.model.previousAttributes();

            //get form data
            $(e.target).closest("form").find(":input").not("button").each(function () {
                var el = $(this);
                formData[el.attr("class")] = el.val();
            });

            //use default photo if none supplied
            if (formData.photo === "") {
                delete formData.photo;
            }

            //update model
            this.model.set(formData).save();

            //render view
            this.render();

            //if model acquired default photo property, remove it
            if (prev.photo === "img/placeholder.png") {
                delete prev.photo;
            }

            //update contacts array
            _.each(contacts, function (contact) {
                if (_.isEqual(contact, prev)) {
                    contacts.splice(_.indexOf(contacts, contact), 1, formData);
                }
            });
        },

        cancelEdit: function () {
            this.render();
        }
    });

    //define master view
    var DirectoryView = Backbone.View.extend({
        el: $("#contacts"),

        initialize: function () {
            this.collection = new Directory(contacts);

            this.render();
            this.$el.find("#filter").append(this.createSelect());
            this.$el.find("#ddwn-filter").append(this.createDropDown());

            this.on("change:filterType", this.filterByType, this);
            this.collection.on("reset", this.render, this);
            this.collection.on("add", this.renderContact, this);
            this.collection.on("remove", this.removeContact, this);
        },

        render: function () {
            this.$el.find("article").remove();

            _.each(this.collection.models, function (item) {
                this.renderContact(item);
            }, this);
        },

        renderContact: function (item) {
            var contactView = new ContactView({
                model: item
            });
            this.$el.find("div.contacts-list").append(contactView.render().el);
        },

        getTypes: function () {
            return _.uniq(this.collection.pluck("type"), false, function (type) {
                return type.toLowerCase();
            });
        },

        createSelect: function () {
            var filter = this.$el.find("#filter"),
                select = $("<select/>", {
                    html: "<option value='all'>All</option>"
                });

            _.each(this.getTypes(), function (item) {
                var option = $("<option/>", {
                    value: item.toLowerCase(),
                    text: item.toLowerCase()
                }).appendTo(select);
            });

            return select;
        },

        //add the dropdownmenu from bootstrap
        createDropDown: function () {
            var filter = this.$el.find("#ddwn-filter"),
                dropMenu = $("<ul/>",{
                    html: "<li><a href='all'>All</a></li>"
                }).addClass("dropdown-menu"),
                arrTypes = _.sortBy(this.getTypes(), function(type){ return type; });

            _.each(arrTypes, function (item) {
                var li = $("<li/>",{
                    html: "<a href='"+item.toLowerCase()+"'>" + item.toLowerCase() + "</a>"
                }).appendTo(dropMenu);
            });
            
            return dropMenu;
        },

        //add ui events
        events: {
            "change #filter select": "setFilter",
            "click #ddwn-filter li a": "setFilter",
            "click #add": "addContact"
            //,"click #showForm": "showForm"
        },

        //Set filter property and fire change event
        setFilter: function (e) {
            e.preventDefault();
            //this.filterType = e.currentTarget.value;
            this.filterType = $(e.currentTarget).attr('href');
            this.trigger("change:filterType");
        },

        //filter the view
        filterByType: function () {
            if (this.filterType === "all") {
                this.collection.reset(contacts);
                contactsRouter.navigate("filter/all");
            } else {
                this.collection.reset(contacts, { silent: true });

                var filterType = this.filterType,
                    filtered = _.filter(this.collection.models, function (item) {
                        return item.get("type").toLowerCase() === filterType;
                    });

                this.collection.reset(filtered);

                contactsRouter.navigate("filter/" + filterType);
            }
        },

        //add a new contact
        addContact: function (e) {
            e.preventDefault();

            var formData = {};
            $("#addContact fieldset").children("input").each(function (i, el) {
			
							
                if ($(el).val() !== "") {
                    formData[el.id] = $(el).val();
                    $(el).val('');
                }
			
            });
			
			if (formData.photo === "") {
				delete formData.photo;
			}

            //update data store
            contacts.push(formData);            

            //re-render select if new type is unknown
            if (_.indexOf(this.getTypes(), formData.type) === -1) {                
                this.$el.find("#ddwn-filter").find("ul").remove().end().append(this.createDropDown());
            }
            this.collection.create(formData);
			
        },

        removeContact: function (removedModel) {
            var removed = removedModel.attributes;

            //if model acquired default photo property, remove it
            if (removed.photo === "img/placeholder.png") {
                delete removed.photo;
            }

            //remove from contacts array
            _.each(contacts, function (contact) {
                if (_.isEqual(contact, removed)) {
                    contacts.splice(_.indexOf(contacts, contact), 1);
                }
            });
        },

        showForm: function () {
            this.$el.find("#addContact").slideToggle();
        }
    });

    //add routing
    var ContactsRouter = Backbone.Router.extend({
        routes: {
            "filter/:type": "urlFilter"
        },

        urlFilter: function (type) {
            directory.filterType = type;
            directory.trigger("change:filterType");
        }
    });



    var contacts,
        directory, 
        contactsRouter;

    $.getJSON('/api/contacts/lista')
        .success(function(data){
            contacts = data;
            directory = new DirectoryView();
            contactsRouter = new ContactsRouter();
            Backbone.history.start(); 
        })
        .error(function(data){
            console.log(data);
        });
    
	
	//console.log(contacts);

} (jQuery));