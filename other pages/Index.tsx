import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Play, Star, Zap, Users, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import gamePuzzle from "@/assets/game-puzzle.jpg";
import gameRacing from "@/assets/game-racing.jpg";
import gameAdventure from "@/assets/game-adventure.jpg";

const Index = () => {
  const featuredGames = [
    {
      title: "Puzzle Master",
      category: "Puzzle",
      thumbnail: gamePuzzle,
      rating: 4.8,
      plays: "125K+"
    },
    {
      title: "Neon Racer", 
      category: "Racing",
      thumbnail: gameRacing,
      rating: 4.6,
      plays: "89K+"
    },
    {
      title: "Mystic Quest",
      category: "Adventure", 
      thumbnail: gameAdventure,
      rating: 4.9,
      plays: "203K+"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-24">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-4 rounded-full bg-white/10 backdrop-blur-sm">
              <Gamepad2 className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-white mb-6 animate-glow-pulse">
            Ann Studios
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Welcome to the ultimate gaming destination. Play amazing browser games instantly, 
            no downloads required. From puzzles to adventures, we've got your entertainment covered!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/games">
              <Button className="bg-gradient-primary hover:bg-gradient-hover text-white border-0 shadow-gaming-glow px-8 py-6 text-lg font-semibold transition-all hover:scale-105">
                <Play className="w-5 h-5 mr-2" />
                Play Games Now
              </Button>
            </Link>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg">
              Browse Collection
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 rounded-full bg-ann-red/20">
                  <Zap className="w-8 h-8 text-ann-red" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-2">500K+</h3>
              <p className="text-muted-foreground">Games Played</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 rounded-full bg-ann-red/20">
                  <Users className="w-8 h-8 text-ann-red" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-2">50K+</h3>
              <p className="text-muted-foreground">Active Players</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 rounded-full bg-ann-red/20">
                  <Trophy className="w-8 h-8 text-ann-red" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-2">100+</h3>
              <p className="text-muted-foreground">Quality Games</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Games */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Featured Games</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Check out our most popular games, handpicked for the best gaming experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {featuredGames.map((game, index) => (
              <Card key={index} className="group overflow-hidden bg-gradient-card border-border hover:border-ann-red transition-all duration-300 hover:shadow-gaming">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={game.thumbnail}
                    alt={game.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="bg-ann-red/20 text-ann-red border-ann-red/30">
                      {game.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {game.rating}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-ann-red transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">{game.plays} plays</p>
                  <Link to="/games">
                    <Button className="w-full bg-gradient-primary hover:bg-gradient-hover text-white border-0">
                      <Play className="w-4 h-4 mr-2" />
                      Play Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link to="/games">
              <Button variant="outline" className="border-ann-red text-ann-red hover:bg-ann-red/10 px-8 py-3">
                View All Games
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Gaming?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of players enjoying our collection of premium browser games. 
            No registration required, just pure gaming fun!
          </p>
          <Link to="/games">
            <Button className="bg-white text-ann-red hover:bg-white/90 px-8 py-6 text-lg font-semibold shadow-gaming-glow">
              <Gamepad2 className="w-5 h-5 mr-2" />
              Start Playing
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
