import Ember from 'ember';
import FactoryGuy, { make, makeList, build, buildList } from 'ember-data-factory-guy';
import MissingSequenceError from 'ember-data-factory-guy/missing-sequence-error';
import JSONAPIFixtureConverter from 'ember-data-factory-guy/jsonapi-fixture-converter';
import RESTFixtureConverter from 'ember-data-factory-guy/rest-fixture-converter';

import User from 'dummy/models/user';
import BigHat from 'dummy/models/big-hat';
import SmallHat from 'dummy/models/small-hat';
import Outfit from 'dummy/models/outfit';

var SharedBehavior = {};

SharedBehavior.makeTests = function () {

  test("creates records in the store", function () {
    var user = make('user');
    ok(user instanceof User);

    var storeUser = FactoryGuy.get('store').peekRecord('user', user.id);
    ok(storeUser === user);
  });


  test("handles custom attribute type attributes", function () {
    var info = {first: 1};
    var user = make('user', {info: info});
    ok(user.get('info') === info);
  });

  test("handles camelCase attributes", function () {
    var profile = make('profile', {camelCaseDescription: 'description'});
    ok(profile.get('camelCaseDescription') === 'description');
  });

  test("with fixture options", function () {
    var profile = make('profile', {description: 'dude'});
    ok(profile.get('description') === 'dude');
  });

  test("with attributes in traits", function () {
    var profile = make('profile', 'goofy_description');
    ok(profile.get('description') === 'goofy');
  });

  test("with attributes in traits and fixture options ", function () {
    var profile = make('profile', 'goofy_description', {description: 'dude'});
    ok(profile.get('description') === 'dude');
  });


  test("when hasMany associations assigned, belongTo parent is assigned", function () {
    //var profile = build('profile');
    var project = make('project');
    var user = make('user', {projects: [project]});
    //var user = build('user', 'with_projects');
    //console.log(user)
    //var profile = build('profile', 'with_company');
    //console.log(profile);
    //var data = {
    //  "data": {
    //    "type": "profile",
    //    "id": 1,
    //    "attributes": {
    //      "description": "textGoesHere",
    //      "camel-case-description": "textGoesHere",
    //      "snake-case-description": "text_goes_here"
    //    },
    //    "relationships": {
    //      "company": {
    //        "data": {"id": 1, "type": "company"},
    //      }
    //    }
    //  },
    //  "included": [
    //    {
    //      "type": "company",
    //      "id": 1,
    //      "attributes": {
    //        "name": "Company B"
    //      }
    //    }
    //  ]
    //}
    //Ember.run(function () {
    //  var profile = FactoryGuy.get('store').push(data);
    //  console.log(profile.get('camelCaseDescription'))
    //})
    ok(project.get('user') === user);
  });


  test("when hasMany ( asnyc ) associations assigned, belongTo parent is assigned", function (assert) {
    Ember.run(function () {
      var done = assert.async();

      var user = make('user');
      var company = make('company', {users: [user]});

      user.get('company').then(function (c) {
        ok(c === company);
        done();
      });
    });
  });


  test("when hasMany ( polymorphic ) associations are assigned, belongTo parent is assigned", function () {
    var bh = make('big-hat');
    var sh = make('small-hat');
    var user = make('user', {hats: [bh, sh]});

    equal(user.get('hats.length'), 2);
    ok(user.get('hats.firstObject') instanceof BigHat);
    ok(user.get('hats.lastObject') instanceof SmallHat);
    // sets the belongTo user association
    ok(bh.get('user') === user);
    ok(sh.get('user') === user);
  });


  test("when hasMany ( self referential ) associations are assigned, belongsTo parent is assigned", function () {
    var big_group = make('big-group');
    var group = make('group', {versions: [big_group]});
    ok(big_group.get('group') === group);
  });


  test("when hasMany associations are assigned, belongsTo parent is assigned using inverse", function () {
    var project = make('project');
    var project2 = make('project', {children: [project]});

    ok(project.get('parent') === project2);
  });


  test("when hasMany associations are assigned, belongsTo parent is assigned using actual belongsTo name", function () {
    var silk = make('silk');
    var bigHat = make('big-hat', {materials: [silk]});

    ok(silk.get('hat') === bigHat);
  });


  test("when hasMany associations are assigned, belongsTo ( polymorphic ) parent is assigned", function () {
    var fluff = make('fluffy-material');
    var bigHat = make('big-hat', {fluffyMaterials: [fluff]});

    ok(fluff.get('hat') === bigHat);
  });


  test("when belongTo parent is assigned, parent adds to hasMany records", function () {
    var user = make('user');
    var project1 = make('project', {user: user});
    var project2 = make('project', {user: user});

    equal(user.get('projects.length'), 2);
    ok(user.get('projects.firstObject') === project1);
    ok(user.get('projects.lastObject') === project2);
  });


  test("when belongTo parent is assigned, parent adds to polymorphic hasMany records", function () {
    var user = make('user');
    make('big-hat', {user: user});
    make('small-hat', {user: user});

    equal(user.get('hats.length'), 2);
    ok(user.get('hats.firstObject') instanceof BigHat);
    ok(user.get('hats.lastObject') instanceof SmallHat);
  });


  test("when hasMany ( async ) relationship is assigned, model relationship is synced on both sides", function (assert) {
    Ember.run(function () {
      var done = assert.async();

      var property = make('property');
      var user1 = make('user', {properties: [property]});
      var user2 = make('user', {properties: [property]});

      equal(property.get('owners.length'), 2);
      ok(property.get('owners.firstObject') === user1);
      ok(property.get('owners.lastObject') === user2);
      done();
    });
  });


  test("when belongsTo ( async ) parent is assigned, parent adds to hasMany records", function (assert) {
    Ember.run(function () {
      var done = assert.async();

      var company = make('company');
      var user1 = make('user', {company: company});
      var user2 = make('user', {company: company});

      equal(company.get('users.length'), 2);
      ok(company.get('users.firstObject') === user1);
      ok(company.get('users.lastObject') === user2);
      done();
    });
  });


  test("when belongTo parent is assigned, parent adds to hasMany record using inverse", function () {
    var project = make('project');
    var project2 = make('project', {parent: project});

    equal(project.get('children.length'), 1);
    ok(project.get('children.firstObject') === project2);
  });


  test("when belongTo parent is assigned, parent adds to hasMany record using actual hasMany name", function () {
    var bh = make('big-hat');
    var silk = make('silk', {hat: bh});

    ok(bh.get('materials.firstObject') === silk);
  });


  test("when belongTo parent is assigned, parent adds to belongsTo record", function () {
    var company = make('company');
    var profile = make('profile', {company: company});
    ok(company.get('profile') === profile);

    // but guard against a situation where a model can belong to itself
    // and do not want to set the belongsTo on this case.
    var hat1 = make('big-hat');
    var hat2 = make('big-hat', {hat: hat1});
    ok(hat1.get('hat') === null);
    ok(hat2.get('hat') === hat1);
  });

  test("belongTo ( polymorphic ) association assigned in optional attributes", function () {
    var small_hat = make('small-hat');
    var feathers = make('feathers', {hat: small_hat});
    ok(feathers.get('hat') instanceof SmallHat);
  });

  test("belongTo ( polymorphic ) association assigned from traits", function () {
    var feathers = make('feathers', 'belonging_to_hat');
    ok(feathers.get('hat') instanceof SmallHat);
  });

  test("belongsTo associations defined as attributes in fixture", function () {
    var project = make('project_with_user');
    equal(project.get('user') instanceof User, true);
    ok(project.get('user.name') === 'User1');

    project = make('project_with_dude');
    ok(project.get('user.name') === 'Dude');

    project = make('project_with_admin');
    ok(project.get('user.name') === 'Admin');
  });


  test("hasMany associations defined as attributes in fixture", function () {
    var user = make('user_with_projects');
    equal(user.get('projects.length'), 2);
    ok(user.get('projects.firstObject.user') === user);
    ok(user.get('projects.lastObject.user') === user);
  });


  test("hasMany associations defined with traits", function () {
    var user = make('user', 'with_projects');
    equal(user.get('projects.length'), 2);
    ok(user.get('projects.firstObject.user') === user);
    ok(user.get('projects.lastObject.user') === user);
  });


  test("belongsTo associations defined with traits", function () {
    var hat1 = make('hat', 'with_user');
    equal(hat1.get('user') instanceof User, true);

    var hat2 = make('hat', 'with_user', 'with_outfit');
    equal(hat2.get('user') instanceof User, true);
    equal(hat2.get('outfit') instanceof Outfit, true);
  });


  test("with (nested json fixture) belongsTo has a hasMany association which has a belongsTo", function () {
    var project = make('project', 'with_user_having_hats_belonging_to_outfit');
    var user = project.get('user');
    var hats = user.get('hats');
    var firstHat = hats.get('firstObject');
    var lastHat = hats.get('lastObject');

    ok(user.get('projects.firstObject') === project);
    ok(firstHat.get('user') === user);
    ok(firstHat.get('outfit.id') === '1');
    ok(firstHat.get('outfit.hats.length') === 1);
    ok(firstHat.get('outfit.hats.firstObject') === firstHat);

    ok(lastHat.get('user') === user);
    ok(lastHat.get('outfit.id') === '2');
    ok(lastHat.get('outfit.hats.length') === 1);
    ok(lastHat.get('outfit.hats.firstObject') === lastHat);
  });


  test("using afterMake with transient attributes in definition", function () {
    Ember.run(function () {
      var property = FactoryGuy.make('property');
      ok(property.get('name') === 'Silly property(FOR SALE)');
    });
  });

  test("using afterMake with transient attributes in options", function () {
    Ember.run(function () {
      var property = FactoryGuy.make('property', {for_sale: false});
      ok(property.get('name') === 'Silly property');
    });
  });

  test("hasMany associations passed to make", function () {
    var project1 = make('project', {id: 1, title: 'Project One'});
    var project2 = make('project', {id: 2, title: 'Project Two'});
    var user = make('user', {projects: [1, 2]});
    equal(project2.get('user'), user);
    equal(user.get('projects').objectAt(0), project1);
    equal(user.get('projects.lastObject.title'), 'Project Two');
  });

  test("belongsTo association pass to make", function () {
    var user = make('user', {id: 1});
    var project = make('project', {title: 'The Project', user: 1});
    equal(project.get('user'), user);
    equal(user.get('projects').objectAt(0), project);
    equal(user.get('projects.firstObject.title'), 'The Project');
  });

  test("hasMany associations passed to make throws error with polymorphic relationships", function () {
    var smallHat = make('small-hat', {id: 1});
    var bigHat = make('big-hat', {id: 2});
    throws(function () {
      var user = make('user', {hats: [1, 2]});
    });
  });

  test("belongsTo association passed to make does not work with polymorphic relationship", function () {
    var parentHat = make('hat', {id: 1});
    throws(function () {
      var childHat = make('hat', {hat: 1});
    });
  });

};

SharedBehavior.makeListTests = function () {

  test("creates list of DS.Model instances", function () {
    var users = FactoryGuy.makeList('user', 2);
    equal(users.length, 2);
    ok(users[0] instanceof User);
    ok(users[1] instanceof User);
    equal(FactoryGuy.get('store').peekAll('user').get('content').length, 2);
  });

  test("handles trait arguments", function () {
    var users = FactoryGuy.makeList('user', 2, 'with_hats');
    equal(users.length, 2);
    equal(users[0].get('hats.length') === 2, true);
  });

  test("handles traits and optional fixture arguments", function () {
    var users = FactoryGuy.makeList('user', 2, 'with_hats', {name: 'Bob'});
    equal(users[0].get('name'), 'Bob');
    equal(users[0].get('hats.length') === 2, true);
  });

};


SharedBehavior.buildListJSONAPITests = function () {

  test("basic", function () {
    var userList = buildList('user', 2);
    deepEqual(userList, {
      data: [{
        id: 1,
        type: 'user',
        attributes: {
          name: 'User1'
        }
      },
        {
          id: 2,
          type: 'user',
          attributes: {
            name: 'User2'
          }
        }]
    });
  });

  test("using custom attributes", function () {
    var userList = buildList('user', 1, {name: 'Crazy'});
    deepEqual(userList, {
        data: [{
          id: 1,
          type: 'user',
          attributes: {
            name: 'Crazy'
          }
        },
        ]
      }
    );
  });


  test("using traits", function () {
    var projectList = buildList('project', 1, 'big');
    deepEqual(projectList, {
      data: [{
        id: 1,
        type: 'project',
        attributes: {
          title: 'Big Project'
        }
      }]
    });
  });


  test("using traits and custom attributes", function () {
    var projectList = buildList('project', 1, 'big', {title: 'Really Big'});
    deepEqual(projectList, {
      data: [{
        id: 1,
        type: 'project',
        attributes: {
          title: 'Really Big'
        }
      }]
    });

  });

};


export default SharedBehavior;
