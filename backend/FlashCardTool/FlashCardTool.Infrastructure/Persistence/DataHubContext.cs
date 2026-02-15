using System;
using FlashCardTool.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlashCardTool.Infrastructure.Persistence;

public class DataHubContext(DbContextOptions<DataHubContext> options) : DbContext(options)
{

    public DbSet<Category> Categories { get; init; }

    public DbSet<Deck> Decks{ get; init; }

    public DbSet<FlashCard> FlashCards{ get; init; }
    
    public DbSet <User> Users{ get; init; }

    public DbSet <PractiseSession> PractiseSessions { get; init;}

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Category>()
        .HasMany(c => c.Decks)
        .WithOne(d => d.Category)
        .HasForeignKey(d => d.CategoryId)
        .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Deck>()
        .HasMany(d => d.Flashcards)
        .WithOne(f => f.Deck)
        .HasForeignKey(f => f.DeckId)
        .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<User>()
        .HasMany(u => u.Categories)
        .WithOne(c => c.User)
        .HasForeignKey(c => c.UserId)
        .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PractiseSession>()
        .HasOne(p => p.Deck)
        .WithMany()
        .HasForeignKey(p => p.DeckId)
        .OnDelete(DeleteBehavior.Cascade);

        var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");

        modelBuilder.Entity<Category>().HasData(
            new Category
            {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                Name = "General",
                UserId = userId
            }
        );

        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = userId,
                Email = "admin@test.com",
            }
        );
    }
}
