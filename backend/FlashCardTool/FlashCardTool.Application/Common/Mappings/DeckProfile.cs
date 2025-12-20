using AutoMapper;
using FlashCardTool.Application.Models;
using FlashCardTool.Domain.Entities;

namespace FlashCardTool.Application.Common.Mappings;

public class DeckProfile : Profile
{
    public DeckProfile()
    {
        CreateMap<DeckDto, Deck>()
        .ForMember(dest => dest.Flashcards, opt => opt.MapFrom(src => src.FlashCards));

        CreateMap<Deck, DeckDto>()
        .ForMember(dest => dest.FlashCards, opt => opt.MapFrom(src => src.Flashcards));

        CreateMap<FlashCardDto, FlashCard>();

        CreateMap<FlashCard, FlashCardDto>();

        CreateMap<Deck, DeckListItemDto>()
        .ForCtorParam(
            "CategoryName",
            opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : string.Empty)
        )
        .ForCtorParam(
            "CategoryId",
            opt => opt.MapFrom(src => src.CategoryId.ToString())
        );
    }
}
