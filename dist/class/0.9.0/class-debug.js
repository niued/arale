/* @author lifesinger@gmail.com */

define("#class/0.9.0/class", [], function() {

    // Class
    // -----------------
    // Thanks to:
    //  - http://mootools.net/docs/core/Class/Class
    //  - http://ejohn.org/blog/simple-javascript-inheritance/
    //  - https://github.com/ded/klass
    //  - http://documentcloud.github.com/backbone/#Model-extend
    //  - https://github.com/joyent/node/blob/master/lib/util.js
    //  - https://github.com/kissyteam/kissy/blob/master/src/seed/src/kissy.js


    // The recursion deep of constructor when call `new SomeClass()`
    var deep = 0;


    // The base Class implementation.
    function Class(o) {
        // Convert existed function to Class.
        if (!(this instanceof Class) && isFunction(o)) {
            return classify(o);
        }
    }


    // Create a new Class.
    //
    //    var SuperPig = Class.create({
    //        Extends: Animal,
    //        Implements: Flyable,
    //        initialize: function() {
    //            SuperPig.superclass.initialize.apply(this, arguments);
    //        },
    //        Statics: {
    //            COLOR: 'red'
    //        }
    //    });
    //
    Class.create = function(parent, properties) {
        if (!isFunction(parent)) {
            properties = parent;
            parent = null;
        }

        properties || (properties = {});
        parent || (parent = properties.Extends || Class);
        properties.Extends = parent;
        properties.initialize || (properties.initialize = noop);


        // The created class constructor
        function SubClass() {
            // Call the parent constructor.
            deep++;
            parent.apply(this, arguments);
            deep--;

            // All construction is actually done in the `initialize` method.
            if (deep === 0) {
                this.initialize.apply(this, arguments);
            }
        }

        // Inherit class (static) properties from parent.
        if (parent !== Class) {
            mix(SubClass, parent);
        }

        // Add instance properties to the subclass.
        implement.call(SubClass, properties);

        // Make subclass extendable.
        return classify(SubClass);
    };


    function implement(properties) {
        var key, value;

        for (key in properties) {
            value = properties[key];

            if (Class.Mutators.hasOwnProperty(key)) {
                Class.Mutators[key].call(this, value);
            } else {
                this.prototype[key] = value;
            }
        }
    }


    // Create a sub Class based on `Class`.
    Class.extend = function(properties) {
        properties || (properties = {});
        properties.Extends = this;

        return Class.create(properties);
    };


    function classify(cls) {
        cls.extend = Class.extend;
        cls.implement = implement;
        return cls;
    }


    // Mutators define special properties.
    Class.Mutators = {
        'Extends': function(parent) {
            var existed = this.prototype;
            var proto = createProto(parent.prototype);

            // Keep existed properties.
            mix(proto, existed);

            // Enforce the constructor to be what we expect.
            proto.constructor = this;

            // Set the prototype chain to inherit from `parent`.
            this.prototype = proto;

            // Set a convenience property in case the parent's prototype is
            // needed later.
            this.superclass = parent.prototype;
        },

        'Implements': function(items) {
            isArray(items) || (items = [items]);
            var proto = this.prototype, item;

            while (item = items.shift()) {
                mix(proto, item.prototype || item);
            }
        },

        'Statics': function(staticProperties) {
            mix(this, staticProperties);
        }
    };


    // Shared empty constructor function to aid in prototype-chain creation.
    function Ctor() {
    }

    // See: http://jsperf.com/object-create-vs-new-ctor
    var createProto = Object.__proto__ ?
            function(proto) {
                return { __proto__: proto };
            } :
            function(proto) {
                Ctor.prototype = proto;
                return new Ctor();
            };


    // Helpers
    // ------------

    function noop() {
    }


    function mix(r, s) {
        // Copy "all" properties including inherited ones.
        for (var p in s) {
            r[p] = s[p];
        }
    }


    var toString = Object.prototype.toString;
    var isArray = Array.isArray;

    if (!isArray) {
        isArray = function(val) {
            return toString.call(val) === '[object Array]';
        };
    }

    var isFunction = function(val) {
        return toString.call(val) === '[object Function]';
    };


    return Class;
});
