import java.util.*;

public class Deck {
    private List<Card> cards;
    private Random random = new Random();

    public Deck() {
        cards = new ArrayList<>();
        String[] suits = {"Corazones", "Picas", "Diamantes", "Tréboles"};
        String[] ranks = {"2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"};
        int[] values =    { 2,   3,   4,   5,   6,   7,   8,   9,   10, 10, 10, 10, 11 };

        for (String suit : suits) {
            for (int i = 0; i < ranks.length; i++) {
                cards.add(new Card(suit, ranks[i], values[i]));
            }
        }

        Collections.shuffle(cards);
    }

    public Card drawCard() {
        return cards.remove(0);
    }
}
