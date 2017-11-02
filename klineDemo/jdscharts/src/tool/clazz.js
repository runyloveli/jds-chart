var zrUtil = require('./util');
var clazz = {};
var TYPE_DELIMITER = '.';
var IS_CONTAINER = '___EC__COMPONENT__CONTAINER___';
var MEMBER_PRIFIX = '\0ec_\0';
clazz.set = function (host, name, value) {
    return (host[MEMBER_PRIFIX + name] = value);
};
clazz.get = function (host, name) {
    return host[MEMBER_PRIFIX + name];
};
clazz.hasOwn = function (host, name) {
    return host.hasOwnProperty(MEMBER_PRIFIX + name);
};
var parseClassType = clazz.parseClassType = function (componentType) {
    var ret = {main: '', sub: ''};
    if (componentType) {
        componentType = componentType.split(TYPE_DELIMITER);
        ret.main = componentType[0] || '';
        ret.sub = componentType[1] || '';
    }
    return ret;
};
function checkClassType(componentType) {
    zrUtil.assert(
        /^[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)?$/.test(componentType),
        'componentType "' + componentType + '" illegal'
    );
}
clazz.enableClassExtend = function (RootClass, mandatoryMethods) {

    RootClass.$constructor = RootClass;
    RootClass.extend = function (proto) {

        if (__DEV__) {
            zrUtil.each(mandatoryMethods, function (method) {
                if (!proto[method]) {
                    console.warn(
                        'Method `' + method + '` should be implemented'
                        + (proto.type ? ' in ' + proto.type : '') + '.'
                    );
                }
            });
        }

        var superClass = this;
        var ExtendedClass = function () {
            if (!proto.$constructor) {
                superClass.apply(this, arguments);
            }
            else {
                proto.$constructor.apply(this, arguments);
            }
        };

        zrUtil.extend(ExtendedClass.prototype, proto);

        ExtendedClass.extend = this.extend;
        ExtendedClass.superCall = superCall;
        ExtendedClass.superApply = superApply;
        zrUtil.inherits(ExtendedClass, this);
        ExtendedClass.superClass = superClass;

        return ExtendedClass;
    };
};
function superCall(context, methodName) {
    var args = zrUtil.slice(arguments, 2);
    return this.superClass.prototype[methodName].apply(context, args);
}

function superApply(context, methodName, args) {
    return this.superClass.prototype[methodName].apply(context, args);
}
clazz.enableClassManagement = function (entity, options) {
    options = options || {};
    var storage = {};

    entity.registerClass = function (Clazz, componentType) {
        if (componentType) {
            checkClassType(componentType);
            componentType = parseClassType(componentType);

            if (!componentType.sub) {
                if (__DEV__) {
                    if (storage[componentType.main]) {
                        console.warn(componentType.main + ' exists.');
                    }
                }
                storage[componentType.main] = Clazz;
            }
            else if (componentType.sub !== IS_CONTAINER) {
                var container = makeContainer(componentType);
                container[componentType.sub] = Clazz;
            }
        }
        return Clazz;
    };

    entity.getClass = function (componentMainType, subType, throwWhenNotFound) {
        var Clazz = storage[componentMainType];

        if (Clazz && Clazz[IS_CONTAINER]) {
            Clazz = subType ? Clazz[subType] : null;
        }

        if (throwWhenNotFound && !Clazz) {
            throw new Error(
                !subType
                    ? componentMainType + '.' + 'type should be specified.'
                    : 'Component ' + componentMainType + '.' + (subType || '') + ' not exists. Load it first.'
            );
        }

        return Clazz;
    };

    entity.getClassesByMainType = function (componentType) {
        componentType = parseClassType(componentType);

        var result = [];
        var obj = storage[componentType.main];

        if (obj && obj[IS_CONTAINER]) {
            zrUtil.each(obj, function (o, type) {
                type !== IS_CONTAINER && result.push(o);
            });
        }
        else {
            result.push(obj);
        }

        return result;
    };

    entity.hasClass = function (componentType) {
        // Just consider componentType.main.
        componentType = parseClassType(componentType);
        return !!storage[componentType.main];
    };
    entity.getAllClassMainTypes = function () {
        var types = [];
        zrUtil.each(storage, function (obj, type) {
            types.push(type);
        });
        return types;
    };
    entity.hasSubTypes = function (componentType) {
        componentType = parseClassType(componentType);
        var obj = storage[componentType.main];
        return obj && obj[IS_CONTAINER];
    };

    entity.parseClassType = parseClassType;

    function makeContainer(componentType) {
        var container = storage[componentType.main];
        if (!container || !container[IS_CONTAINER]) {
            container = storage[componentType.main] = {};
            container[IS_CONTAINER] = true;
        }
        return container;
    }

    if (options.registerWhenExtend) {
        var originalExtend = entity.extend;
        if (originalExtend) {
            entity.extend = function (proto) {
                var ExtendedClass = originalExtend.call(this, proto);
                return entity.registerClass(ExtendedClass, proto.type);
            };
        }
    }

    return entity;
};
clazz.setReadOnly = function (obj, properties) {};

module.exports =  clazz;