var LineItemTemplate = require("../views/templates/line_item");
var SessionLabelTemplate = require("../views/templates/sessions_label");
var SessionModel = require("../models/session");

module.exports = Backbone.View.extend({

    initialize:function () {
        _.bindAll(this, "loadSession", "loadSessions", "saveNewSession", "saveSession", "getProducerAttributes");

        $(document.body).append(SessionLabelTemplate());

        $("a.new-session").live("click", function () {
            $(".sessions-labeler").modal("show");
        });

        $(".sessions-labeler button.save-new-session").click(this.saveNewSession);
        $("a.load-session").live("click", this.loadSession);
        $("a.save-session").live("click", this.saveSession);

        qed.Sessions.All.on("add", this.loadSessions);
        this.loadSessions();
    },

    loadSessions:function () {
        console.log("loadSessions");
        this.$el.empty();
        _.each(qed.Sessions.All.get("items"), function (item) {
            var icls = _.isEqual(item, qed.Sessions.Active) ? "icon-ok" : "";
            this.$el.append(LineItemTemplate({ "a_class":"load-session", "id":item.get("id"), "i_class": icls, "label": item.get("label") }));
        }, this);
    },

    loadSession:function (e) {
        var sessionId = $(e.target).data("id");
        if (sessionId) {
            $("a.save-session").parent().removeClass("disabled");
            $("a.save-session").data("id", sessionId);
            qed.Router.navigate("#s/" + sessionId, {trigger:true});
        }
    },

    saveNewSession:function () {
        var label = $(".sessions-labeler").find(".session-label").val();
        $(".sessions-labeler").modal("hide");

        var newSession = _.extend(this.getProducerAttributes(), { "label":label.trim(), "route":Backbone.history.fragment });
        qed.Sessions.All.create(newSession, {wait: true});
    },

    saveSession:function (e) {
        var sessionId = $(e.target).data("id");
        if (sessionId) {
            var session = qed.Sessions.All.get(sessionId);
            if (session) {
                session.save(_.extend(this.getProducerAttributes(), { "route":Backbone.history.fragment }));
            }
        }
    },

    getProducerAttributes:function () {
        var producer_attributes = {};
        _.each(qed.Sessions.Producers, function (producer, key) {
            var currentState = producer.currentState();
            if (currentState) {
                producer_attributes[key] = currentState;
            }
        });
        return producer_attributes;
    }
});
