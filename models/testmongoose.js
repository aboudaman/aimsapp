const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Person = mongoose.model('Person', mongoose.Schema({
    name: String
  }));
  
  // `ref` tells Mongoose populate what model to query
  const Movie = mongoose.model('Movie', mongoose.Schema({
    title: String,
    director: {
      type: mongoose.ObjectId,
      ref: 'Person'
    },
    actors: [{
      type: mongoose.ObjectId,
      ref: 'Person'
    }]
  }))

  async function test() {
    const people = await Person.create([
        { name: 'James Cameron' },
        { name: 'Arnold Schwarzenegger' },
        { name: 'Linda Hamilton' }
      ]);
      await Movie.create({
        title: 'Terminator 2',
        director: people[0]._id,
        actors: [people[1]._id, people[2]._id]
      });
      
      // Load just the movie's director
      let movie = await Movie.findOne().populate('director');
      movie.director.name; // 'James Cameron'
      movie.actors[0].name; // undefined
      
      // Load both the director and the actors
      movie = await Movie.findOne().populate('director').populate('actors');
      movie.director.name; // 'James Cameron'
      movie.actors[0].name; // 'Arnold Schwarzenegger'
      movie.actors[1].name; // 'Linda Hamilton'

      console.log(movie.actors[1].name)
  }

  test()
