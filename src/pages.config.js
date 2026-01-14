import Home from './pages/Home';
import Profile from './pages/Profile';
import Services from './pages/Services';
import Challenges from './pages/Challenges';
import Adoption from './pages/Adoption';
import LostFound from './pages/LostFound';
import Explore from './pages/Explore';
import CreatePost from './pages/CreatePost';
import Messages from './pages/Messages';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Profile": Profile,
    "Services": Services,
    "Challenges": Challenges,
    "Adoption": Adoption,
    "LostFound": LostFound,
    "Explore": Explore,
    "CreatePost": CreatePost,
    "Messages": Messages,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};